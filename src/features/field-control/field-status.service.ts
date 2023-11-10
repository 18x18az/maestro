import { Injectable } from '@nestjs/common'
import { FieldService } from '../field/field.service'
import { FieldState, FieldStatus } from './field-control.interface'
import { FieldControlRepo } from './field-control.repo'
import { FieldControlPublisher } from './field-control.publisher'
import { MatchStatus } from '../match'

@Injectable()
export class FieldStatusService {
  constructor (
    private readonly fields: FieldService,
    private readonly repo: FieldControlRepo,
    private readonly publisher: FieldControlPublisher
  ) {}

  async get (fieldId: number): Promise<FieldStatus> {
    const fields = await this.fields.getCompetitionFields()
    const field = fields.find(field => field.id === fieldId)
    if (field === undefined) {
      throw new Error(`Field ${fieldId} not found`)
    }

    const stored = await this.repo.getFieldStatus(fieldId)

    let state = FieldState.IDLE
    if (stored.onField !== null) {
      const onFieldState = stored.onField.status
      if (onFieldState === MatchStatus.SCORING) {
        state = FieldState.SCORING
      }
    }

    const status: FieldStatus = {
      field,
      match: stored.onField,
      onDeck: stored.onDeck,
      state,
      endTime: null
    }

    return status
  }

  async getAll (): Promise<FieldStatus[]> {
    const fields = await this.fields.getCompetitionFields()
    const statuses = await Promise.all(fields.map(async field => await this.get(field.id)))
    return statuses
  }

  async refresh (fieldId: number): Promise<void> {
    const allStatus = await this.getAll()
    const status = allStatus.find(status => status.field.id === fieldId)
    if (status === undefined) {
      throw new Error(`Field ${fieldId} not found`)
    }
    await this.publisher.publishFieldStatus(status)
    await this.publisher.publishFieldStatuses(allStatus)
  }
}
