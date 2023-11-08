import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldService } from '../field/field.service'
import { FieldState, FieldStatus } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'
import { Match, MatchService } from '../match'
import { FieldControlRepo } from './field-control.repo'

@Injectable()
export class FieldControlInternal {
  private readonly logger: Logger = new Logger(FieldControlInternal.name)

  private onDeck: FieldStatus | null = null
  private active: FieldStatus | null = null

  private readonly isAutomated = true

  constructor (
    private readonly fields: FieldService,
    private readonly publisher: FieldControlPublisher,
    private readonly match: MatchService,
    private readonly repo: FieldControlRepo
  ) { }

  private async loadStatuses (): Promise<FieldStatus[]> {
    const fields = await this.fields.getCompetitionFields()
    const allStatus = await Promise.all(fields.map(async field => await this.getFieldStatus(field.id)))
    return allStatus
  }

  async onApplicationBootstrap (): Promise<void> {
    const initialStatus = await this.loadStatuses()

    // get all non null matches either in match or on deck
    const matches = initialStatus.flatMap(status => {
      const nonNullMatches: Match[] = []
      if (status.match !== null) {
        nonNullMatches.push(status.match)
      }
      if (status.onDeck !== null) {
        nonNullMatches.push(status.onDeck)
      }
      return nonNullMatches
    })

    await this.match.reconcileQueued(matches)
    await this.publisher.publishFieldStatuses(initialStatus)

    await this.publisher.publishActiveField(null)
    await this.publisher.publishNextField(null)

    for (const status of initialStatus) {
      await this.analyzeField(status.field.id)
    }
  }

  private async getFieldStatus (fieldId: number): Promise<FieldStatus> {
    const fields = await this.fields.getCompetitionFields()
    const field = fields.find(field => field.id === fieldId)
    if (field === undefined) {
      throw new Error(`Field ${fieldId} not found`)
    }

    const stored = await this.repo.getFieldStatus(fieldId)

    const status: FieldStatus = {
      field,
      match: stored.onField,
      onDeck: stored.onDeck,
      state: FieldState.IDLE
    }

    return status
  }

  async updateFieldStatus (fieldId: number): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    const allStatus = await Promise.all(fields.map(async field => await this.getFieldStatus(field.id)))
    const status = allStatus.find(status => status.field.id === fieldId)
    if (status === undefined) {
      throw new Error(`Field ${fieldId} not found`)
    }
    await this.publisher.publishFieldStatus(status)
    await this.publisher.publishFieldStatuses(allStatus)

    if (this.active !== null && this.active.field.id === fieldId) {
      if (status.match === null) {
        this.active = null
      } else {
        this.active = status
      }
      await this.publisher.publishActiveField(this.active)
    }

    if (this.onDeck !== null && this.onDeck.field.id === fieldId) {
      if (status.match === null) {
        this.onDeck = null
      } else {
        this.onDeck = status
      }
      await this.publisher.publishNextField(this.onDeck)
    }

    await this.analyzeField(fieldId)
  }

  private async analyzeField (fieldId: number): Promise<void> {
    if (!this.isAutomated) {
      return
    }

    const status = await this.getFieldStatus(fieldId)

    if (status.onDeck !== null) {
      return
    }

    this.logger.log(`Field ${status.field.name} has no match on deck`)

    const unqueuedMatches = await this.match.getUnqueuedMatches()

    // find first match that either has a matching field id or a null field id
    const match = unqueuedMatches.find(match => match.fieldId === null || match.fieldId === status.field.id)

    if (match === undefined) {
      this.logger.log(`No remaining matches found for field ${status.field.name}`)
      return
    }

    await this.queueField(status.field.id, match.id)
  }

  async queueField (fieldId: number, match: number): Promise<void> {
    this.logger.log(`Queueing match ID ${match} on field ID ${fieldId}`)
    await this.match.markQueued(match)
    await this.fields.queueMatch(fieldId, match)
    await this.updateFieldStatus(fieldId)
  }

  async removeFromQueue (match: number): Promise<void> {
    this.logger.log(`Removing match ID ${match} from queue`)
    const fieldOnId = await this.repo.findMatchField(match)
    if (fieldOnId === null) {
      this.logger.warn(`Match ID ${match} not found on any field`)
      throw new BadRequestException(`Match ID ${match} not found on any field`)
    }

    await this.match.unmarkQueued(match)
    await this.fields.removeMatch(fieldOnId, match)
    await this.updateFieldStatus(fieldOnId)
  }

  async moveMatch (match: number, targetFieldId: number): Promise<void> {
    this.logger.log(`Moving match ID ${match} to field ID ${targetFieldId}`)
    const fieldOnId = await this.repo.findMatchField(match)
    if (fieldOnId === null) {
      this.logger.warn(`Match ID ${match} not found on any field`)
      throw new BadRequestException(`Match ID ${match} not found on any field`)
    }

    await this.fields.removeMatch(fieldOnId, match)
    await this.fields.queueMatch(targetFieldId, match)
    await this.updateFieldStatus(fieldOnId)
    await this.updateFieldStatus(targetFieldId)
  }

  async markNext (field: number): Promise<void> {
    this.logger.log(`Marking field ID ${field} as next`)
    const status = await this.getFieldStatus(field)

    if (status.match === null) {
      this.logger.warn(`Field ID ${field} has no match`)
      throw new BadRequestException(`Field ID ${field} has no match`)
    }

    this.onDeck = status

    await this.publisher.publishNextField(status)
  }

  async pushActive (): Promise<void> {
    if (this.onDeck === null) {
      this.logger.warn('No field marked as next')
      throw new BadRequestException('No field marked as next')
    }

    this.logger.log(`Pushing field ${this.onDeck.field.name} to active`)

    this.active = this.onDeck
    this.onDeck = null

    await this.publisher.publishActiveField(this.active)
    const allFields = await this.loadStatuses()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const activeFieldIndex = allFields.findIndex(field => field.field.id === this.active!.field.id)
    const nextFieldIndex = (activeFieldIndex + 1) % allFields.length
    if (allFields[nextFieldIndex].match !== null) {
      await this.markNext(allFields[nextFieldIndex].field.id)
    } else {
      await this.publisher.publishNextField(null)
    }
  }

  async clearActive (): Promise<void> {
    if (this.active === null) {
      this.logger.warn('No field marked as active')
      throw new BadRequestException('No field marked as active')
    }

    this.logger.log(`Clearing active field ${this.active.field.name}`)

    this.active = null
    await this.publisher.publishActiveField(null)
  }
}
