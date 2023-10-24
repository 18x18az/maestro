import { StorageService } from '@/utils/storage/storage.service'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldStatus, MatchResult, QualBlock, QualMatch, STAGE, FieldState } from './simple.interface'
import { SimplePublisher } from './simple.publisher'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { teamParser } from './teamParser'
import { blockParser, qualParser } from './qualParser'
import { SimpleRepo } from './simple.repo'
import { parseQualResults } from './results.parser'

@Injectable()
export class SimpleService {
  private readonly logger = new Logger(SimpleService.name)
  private tmAddr: string | null = null
  private blocks: QualBlock[] | null = null
  private readonly matchResult: MatchResult | null = null
  private fieldStatuses: FieldStatus[] = []

  constructor (private readonly storage: StorageService,
    private readonly publisher: SimplePublisher,
    private readonly request: HttpService,
    private readonly repo: SimpleRepo
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.repo.ensureFieldsExists()
    const stage = await this.storage.getEphemeral('stage', STAGE.WAITING_FOR_TEAMS) as STAGE
    await this.setStage(stage)

    if (stage === STAGE.WAITING_FOR_TEAMS) return

    this.logger.log('Getting teams from TM')
    const tmAddr = await this.storage.getEphemeral('tmAddr', '')
    if (tmAddr === '') {
      this.logger.error('No TM address found')
      return
    }

    this.tmAddr = tmAddr
    await this.getTeams(tmAddr)

    if (stage === STAGE.WAITING_FOR_MATCHES) return

    this.logger.log('loading qual matches')

    const quals = await this.repo.getQuals()
    await this.handleQuals(quals)
    await this.initializeFields()
    await this.getMatchResults()
  }

  private async handleQuals (quals: QualMatch[]): Promise<void> {
    const blocks = blockParser(quals)
    this.blocks = blocks
    await this.publisher.publishQuals(blocks)
  }

  private async setStage (stage: STAGE): Promise<void> {
    this.logger.log(`Setting stage to ${stage}`)
    await this.storage.setEphemeral('stage', stage)
    await this.publisher.publishStage(stage)
  }

  private async publishFieldStatuses (): Promise<void> {
    for (const fieldStatus of this.fieldStatuses) {
      await this.publisher.publishFieldStatus(fieldStatus)
    }
    await this.publisher.publishFieldStatuses(this.fieldStatuses)
  }

  private async initializeFields (): Promise<void> {
    const fields = await this.repo.getFields()
    this.fieldStatuses = fields.map(field => ({ ...field, state: FieldState.IDLE }))
    await this.publishFieldStatuses()
  }

  private async getTeams (addr: string): Promise<void> {
    const url = `http://${addr}/division1/teams`
    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(`Error connecting to ${addr}: ${error.message}`)
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      throw new BadRequestException(`TM at ${addr} is not responding`)
    }

    const teams = teamParser(data)

    if (teams === null) {
      throw new BadRequestException(`TM at ${addr} responded badly`)
    }
    await this.publisher.publishTeams(teams)
  }

  async connectTm (addr: string): Promise<void> {
    this.logger.log(`Trying TM at ${addr}`)
    await this.getTeams(addr)
    this.tmAddr = addr
    await this.storage.setEphemeral('tmAddr', addr)
    await this.setStage(STAGE.WAITING_FOR_MATCHES)
  }

  async handleQualListUpload (data: string): Promise<void> {
    const fields = await this.repo.getFieldIds()
    const [quals, fieldNames] = qualParser(data, fields)

    await this.repo.setFieldNames(fieldNames)
    await this.initializeFields()

    this.logger.log(`Storing ${quals.length} quals`)
    await this.repo.storeQuals(quals)
    await this.handleQuals(quals)

    await this.setStage(STAGE.QUAL_MATCHES)
  }

  async reset (): Promise<void> {
    await this.storage.clearEphemeral()
    await this.repo.reset()
    await this.setStage(STAGE.WAITING_FOR_TEAMS)
  }

  private async startNextBlock (): Promise<void> {
    if (this.blocks === null) {
      throw new Error('No blocks loaded')
    }

    const block = this.blocks[0]

    for (let i = 0; i < this.fieldStatuses.length; i++) {
      const fieldStatus = this.fieldStatuses[i]
      const match = block.matches[i]

      fieldStatus.state = FieldState.ON_DECK
      fieldStatus.match = {
        round: 0,
        match: match.matchNum,
        sitting: 0
      }

      fieldStatus.blueAlliance = { team1: match.blue1, team2: match.blue2 }
      fieldStatus.redAlliance = { team1: match.red1, team2: match.red2 }
      fieldStatus.time = match.time
    }
    await this.publishFieldStatuses()
  }

  async continue (): Promise<void> {
    const stage = await this.storage.getEphemeral('stage', STAGE.WAITING_FOR_TEAMS) as STAGE

    if (stage === STAGE.QUAL_MATCHES) {
      // check if all field statuses are idle
      if (this.fieldStatuses.every(fieldStatus => fieldStatus.state === FieldState.IDLE)) {
        await this.startNextBlock()
      }
    }
  }

  async getMatchResults (): Promise<void> {
    if (this.tmAddr === null) {
      throw new Error('TM address not set')
    }

    const url = `http://${this.tmAddr}/division1/matches`
    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(`Error connecting to ${this.tmAddr as string}: ${error.message}`)
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      this.logger.warn(`TM at ${this.tmAddr} is not responding`)
      return
    }

    parseQualResults(data)
  }
}
