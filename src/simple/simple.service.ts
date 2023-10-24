import { StorageService } from '@/utils/storage/storage.service'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { QualBlock, QualMatch, STAGE, Team } from './simple.interface'
import { SimplePublisher } from './simple.publisher'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { teamParser } from './teamParser'
import { blockParser, qualParser } from './qualParser'
import { SimpleRepo } from './simple.repo'

@Injectable()
export class SimpleService {
  private readonly logger = new Logger(SimpleService.name)
  private teams: Team[] | null = null
  private tmAddr: string | null = null
  private blocks: QualBlock[] | null = null

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
    this.teams = teams
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
    const quals = qualParser(data, fields)

    this.logger.log(`Storing ${quals.length} quals`)
    await this.repo.storeQuals(quals)
    await this.handleQuals(quals)

    await this.setStage(STAGE.QUAL_MATCHES)
  }

  async reset (): Promise<void> {
    await this.storage.clearEphemeral()
    await this.setStage(STAGE.WAITING_FOR_TEAMS)
  }
}
