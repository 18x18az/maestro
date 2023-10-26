import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldState, FieldStatus, MATCH_STATE, Match, MatchIdentifier } from './simple.interface'
import { SimplePublisher } from './simple.publisher'
import { SimpleRepo } from './simple.repo'

@Injectable()
export class FieldControlService {
  private fieldStatuses: FieldStatus[] = []
  private fieldControl: FieldStatus | null = null
  private readonly logger = new Logger(FieldControlService.name)

  constructor (
    private readonly publisher: SimplePublisher,
    private readonly repo: SimpleRepo
  ) {}

  private async publishFieldControl (): Promise<void> {
    if (this.fieldControl === null) {
      this.logger.warn('No field control')
      return
      // throw new BadRequestException('No field control')
    }

    await this.publisher.publishFieldControl(this.fieldControl)
    await this.publisher.publishFieldStatuses(this.fieldStatuses)
    await this.publisher.publishFieldStatus(this.fieldControl)
  }

  private async publishFieldStatuses (): Promise<void> {
    for (const fieldStatus of this.fieldStatuses) {
      await this.publisher.publishFieldStatus(fieldStatus)
    }
    await this.publisher.publishFieldStatuses(this.fieldStatuses)
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

  async startAuto (): Promise<FieldStatus> {
    const currentMatch = this.fieldControl

    if (currentMatch === null) throw new BadRequestException('No match')
    if (currentMatch.state !== FieldState.ON_DECK && currentMatch.state !== FieldState.PAUSED) throw new BadRequestException('Match not on deck')

    const time = new Date(Date.now() + 15000)
    await this.updateFieldControl(FieldState.AUTO, time)

    return currentMatch
  }

  async resumeMatch (): Promise<FieldStatus> {
    const currentMatch = this.fieldControl

    if (currentMatch === null) throw new BadRequestException('No match')
    if (currentMatch.state !== FieldState.PAUSED) throw new BadRequestException('Match not paused')

    const time = new Date(Date.now() + 105000)
    await this.updateFieldControl(FieldState.DRIVER, time)

    return currentMatch
  }

  getPendingScoreFields (): FieldStatus[] {
    return this.fieldStatuses.filter(fieldStatus => fieldStatus.state === FieldState.SCORING)
  }

  async initializeFields (): Promise<void> {
    const fields = await this.repo.getFields()
    this.fieldStatuses = fields.map(field => ({ ...field, state: FieldState.IDLE }))
    await this.publishFieldStatuses()
  }

  getFieldStatus (fieldId: number): FieldStatus | null {
    return this.fieldStatuses.find(fieldStatus => fieldStatus.id === fieldId) ?? null
  }

  async putMatchOnField (fieldId: number, match: Match, status: FieldState): Promise<void> {
    const fieldStatusToUpdate = this.getFieldStatus(fieldId)

    if (fieldStatusToUpdate === null) {
      throw new Error('Field not found to update')
    }

    fieldStatusToUpdate.state = status
    fieldStatusToUpdate.match = { round: match.round, match: match.matchNum, sitting: match.sitting }
    fieldStatusToUpdate.redAlliance = { team1: match.red1, team2: match.red2 }
    fieldStatusToUpdate.blueAlliance = { team1: match.blue1, team2: match.blue2 }
    fieldStatusToUpdate.time = match.time

    this.logger.log(`Queueing match ${match.round}-${match.matchNum}-${match.sitting} on ${fieldStatusToUpdate.name}`)
    const identifier: MatchIdentifier = { round: match.round, match: match.matchNum, sitting: match.sitting }
    await this.repo.updateMatchStatus(identifier, MATCH_STATE.ON_FIELD)
    await this.publisher.publishFieldStatus(fieldStatusToUpdate)

    setTimeout(() => { void this.controlNextMatch() }, 1000)

    await this.controlNextMatch()
    await this.publishFieldControl()
  }

  getCurrentMatch (): FieldStatus | null {
    return this.fieldControl
  }

  async controlNextMatch (): Promise<void> {
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

  allFieldsIdle (): boolean {
    return this.fieldStatuses.every(fieldStatus => fieldStatus.state === FieldState.IDLE)
  }
}
