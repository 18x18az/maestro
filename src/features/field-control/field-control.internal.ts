import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldService } from '../field/field.service'
import { FieldState, FieldStatus } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'
import { Match, MatchService } from '../match'
import { FieldControlRepo } from './field-control.repo'

@Injectable()
export class FieldControlInternal {
  private readonly logger: Logger = new Logger(FieldControlInternal.name)

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
}
