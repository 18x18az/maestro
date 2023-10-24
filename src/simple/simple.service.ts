import { StorageService } from '@/utils/storage/storage.service'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldStatus, MatchResult, Match, STAGE, FieldState, MATCH_STATE } from './simple.interface'
import { SimplePublisher } from './simple.publisher'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { teamParser } from './teamParser'
import { SimpleRepo } from './simple.repo'
import { parseQualResults } from './results.parser'
import { qualParser } from './qualParser'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class SimpleService {
  private readonly logger = new Logger(SimpleService.name)
  private tmAddr: string | null = null
  private readonly matchResult: MatchResult | null = null
  private fieldStatuses: FieldStatus[] = []
  private fieldControl: FieldStatus | null = null
  private currentTimeout: NodeJS.Timeout | null = null

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

    await this.initializeFields()
    await this.publishFields()
    await this.loadFields()
  }

  @Cron('*/10 * * * * *')
  async pollResults (): Promise<void> {
    // check if there are any matches awaiting results
    if (this.fieldStatuses === null) return

    const pendingScoreFields = this.fieldStatuses.filter(fieldStatus => fieldStatus.state === FieldState.SCORING)

    if (pendingScoreFields.length === 0) return

    const results = await this.getMatchResults()
    if (results === null) return

    for (const pendingField of pendingScoreFields) {
      const ident = pendingField.match
      if (ident === undefined) throw new Error('Field is pending but has no match')
      const result = results.find(result => result.round === ident.round && result.match === ident.match && result.sitting === ident.sitting)
      if (result === undefined) continue

      this.logger.log(`Match ${ident.round}-${ident.match}-${ident.sitting} on ${pendingField.name} has results`)

      await this.repo.updateMatchStatus(ident, MATCH_STATE.RESOLVED)
      await this.queueField(pendingField.id)
    }
  }

  private async publishFields (): Promise<void> {
    const fields = await this.repo.getFields()
    await this.publisher.publishFields(fields)
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
    await this.updateControlState()
  }

  private async publishFieldControl (): Promise<void> {
    if (this.fieldControl === null) {
      throw new BadRequestException('No field control')
    }

    await this.publisher.publishFieldControl(this.fieldControl)
    await this.publisher.publishFieldStatuses(this.fieldStatuses)
    await this.publisher.publishFieldStatus(this.fieldControl)
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
    const [blocks, fieldNames] = qualParser(data, fields)

    this.logger.log(`Storing ${blocks.length} qual blocks`)

    await this.repo.setFieldNames(fieldNames)
    await this.repo.storeBlocks(blocks)
    await this.initializeFields()

    await this.publishFields()

    await this.setStage(STAGE.QUAL_MATCHES)
  }

  async reset (): Promise<void> {
    await this.storage.clearEphemeral()
    await this.repo.reset()
    await this.setStage(STAGE.WAITING_FOR_TEAMS)
  }

  private async handleEmptyField (fieldId: number): Promise<void> {
    this.logger.log(`Field ${fieldId} is empty`)
  }

  private async loadFields (): Promise<void> {
    this.logger.log('Loading fields')
    const currentBlock = await this.repo.getInProgressBlock()

    if (currentBlock === null) {
      this.logger.log('No block in progress')
      return
    }

    const fieldIds = await this.repo.getFieldIds()
    for (const fieldId of fieldIds) {
      const match = await this.repo.getCurrentMatch(fieldId, currentBlock)
      if (match === null) {
        await this.handleEmptyField(fieldId)
        continue
      }

      const matchProgress = match.status

      let fieldState = FieldState.ON_DECK

      if (matchProgress === MATCH_STATE.NOT_STARTED || matchProgress === MATCH_STATE.RESOLVED) {
        throw new Error('Match not on field')
      } else if (matchProgress === MATCH_STATE.ON_FIELD) {
        fieldState = FieldState.ON_DECK
      } else if (matchProgress === MATCH_STATE.SCORING) {
        fieldState = FieldState.SCORING
      }

      await this.putMatchOnField(fieldId, match, fieldState)
    }
  }

  private async putMatchOnField (fieldId: number, match: Match, status: FieldState): Promise<void> {
    const fieldStatusToUpdate = this.fieldStatuses.find(fieldStatus => fieldStatus.id === fieldId)
    if (fieldStatusToUpdate === undefined) {
      throw new Error('Field not found to update')
    }

    fieldStatusToUpdate.state = status
    fieldStatusToUpdate.match = { round: match.round, match: match.matchNum, sitting: match.sitting }
    fieldStatusToUpdate.redAlliance = { team1: match.red1, team2: match.red2 }
    fieldStatusToUpdate.blueAlliance = { team1: match.blue1, team2: match.blue2 }
    fieldStatusToUpdate.time = match.time

    this.logger.log(`Queueing match ${match.round}-${match.matchNum}-${match.sitting} on ${fieldStatusToUpdate.name}`)

    const identifier = { round: match.round, match: match.matchNum, sitting: match.sitting }

    let matchState = MATCH_STATE.ON_FIELD
    if (status === FieldState.SCORING) {
      matchState = MATCH_STATE.SCORING
    }

    await this.repo.updateMatchStatus(identifier, matchState)
    await this.publishFieldStatuses()
  }

  private async updateControlState (): Promise<void> {
    const onDeckFields = this.fieldStatuses.filter(fieldStatus =>
      [FieldState.AUTO, FieldState.DRIVER, FieldState.ON_DECK, FieldState.PAUSED].includes(fieldStatus.state))

    if (onDeckFields.length === 0) {
      return
    }

    const nextMatch = onDeckFields.sort((a, b) => {
      if (a.match === undefined || b.match === undefined) {
        return 0
      }
      if (a.match.round !== b.match.round) {
        return a.match.round - b.match.round
      }
      if (a.match.match !== b.match.match) {
        return a.match.match - b.match.match
      }
      if (a.match.sitting !== b.match.sitting) {
        return a.match.sitting - b.match.sitting
      }
      return 0
    })[0]

    this.fieldControl = nextMatch
    this.logger.log(`Field control is on ${nextMatch.name} with state ${nextMatch.state}`)
    await this.publisher.publishFieldControl(nextMatch)
  }

  private async queueField (fieldId: number): Promise<void> {
    const block = await this.repo.getInProgressBlock()

    if (block === null) {
      throw new BadRequestException('No block in progress')
    }

    const match = await this.repo.getNextMatch(fieldId, block)

    if (match === null) {
      await this.handleEmptyField(fieldId)
      return
    }

    await this.putMatchOnField(fieldId, match, FieldState.ON_DECK)
  }

  private async startNextBlock (): Promise<void> {
    const block = await this.repo.getNextBlockId()

    if (block === null) {
      // TODO handle end of quals
      return
    }

    const fieldIds = await this.repo.getFieldIds()
    for (const fieldId of fieldIds) {
      await this.queueField(fieldId)
    }
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

  async getMatchResults (): Promise<MatchResult[] | null> {
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
      return null
    }

    const results = parseQualResults(data)
    return results
  }

  async updateFieldControl (state: FieldState, time?: Date): Promise<void> {
    if (this.fieldControl === null) {
      throw new BadRequestException('No field control')
    }

    const fieldStatus = this.fieldStatuses.find(fieldStatus => fieldStatus.id === this.fieldControl?.id)
    if (fieldStatus === undefined) {
      throw new BadRequestException('Field not found')
    }

    fieldStatus.state = state
    fieldStatus.time = time
    this.fieldControl.state = state
    this.fieldControl.time = time
    await this.publishFieldControl()
  }

  async resumeMatch (): Promise<void> {
    if (this.fieldControl === null) {
      throw new BadRequestException('No field control')
    }

    if (this.fieldControl.state !== FieldState.PAUSED) {
      throw new BadRequestException('Field not paused')
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger.log(`Resuming match ${this.fieldControl.match?.round}-${this.fieldControl.match?.match}-${this.fieldControl.match?.sitting} on ${this.fieldControl.name}`)
    const endTime = new Date(Date.now() + 105 * 1000)
    await this.updateFieldControl(FieldState.DRIVER, endTime)
    const timeRemaining = endTime.getTime() - Date.now()
    this.currentTimeout = setTimeout(() => {
      void this.matchEnd()
    }, timeRemaining)
  }

  async matchEnd (): Promise<void> {
    if (this.currentTimeout !== null) {
      clearTimeout(this.currentTimeout)
    }
    this.logger.log('Match ended')
    if (this.fieldControl === null) {
      this.logger.error('No field control')
      throw new BadRequestException('No field control')
    }

    const match = this.fieldControl.match

    if (match === undefined) {
      throw new BadRequestException('No match')
    }

    const identifier = { round: match.round, match: match.match, sitting: match.sitting }
    await this.repo.updateMatchStatus(identifier, MATCH_STATE.SCORING)
    await this.updateFieldControl(FieldState.SCORING)
    await this.updateControlState()
  }

  async autoEnd (): Promise<void> {
    if (this.currentTimeout !== null) {
      clearTimeout(this.currentTimeout)
    }
    this.logger.log('Auto ended')
    await this.updateFieldControl(FieldState.PAUSED)
  }

  async startAuto (): Promise<void> {
    if (this.fieldControl === null) {
      throw new BadRequestException('No field control')
    }

    if (this.fieldControl.state !== FieldState.ON_DECK && this.fieldControl.state !== FieldState.PAUSED && this.fieldControl.state !== FieldState.SCORING) {
      throw new BadRequestException('Field not ready to start')
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger.log(`Starting match ${this.fieldControl.match?.round}-${this.fieldControl.match?.match}-${this.fieldControl.match?.sitting} on ${this.fieldControl.name}`)
    const endTime = new Date(Date.now() + 15 * 1000)
    await this.updateFieldControl(FieldState.AUTO, endTime)
    // set timeout to end auto
    const timeRemaining = endTime.getTime() - Date.now()
    this.currentTimeout = setTimeout(() => {
      void this.autoEnd()
    }, timeRemaining)
  }
}
