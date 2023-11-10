import { Injectable, Logger } from '@nestjs/common'
import { FieldRepo } from './field.repo'
import { Field } from './field.interface'
import { FieldPublisher } from './field.publisher'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)

  constructor (
    private readonly repo: FieldRepo,
    private readonly publisher: FieldPublisher
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const existing = await this.getCompetitionFields()
    await this.publisher.publishFields(existing)
  }

  async initializeCompetitionFields (fields: string[]): Promise<void> {
    this.logger.log(`Initializing ${fields.length} fields with names ${fields.join(', ')}`)
    await this.repo.initializeCompetitionFields(fields)
    const fieldInfo = await this.getCompetitionFields()
    await this.publisher.publishFields(fieldInfo)
  }

  async getCompetitionFields (): Promise<Field[]> {
    return await this.repo.getCompetitionFields()
  }

  async getCompetitionFieldName (fieldId: number): Promise<string> {
    return await this.repo.getCompetitionFieldName(fieldId)
  }

  async queueMatch (fieldId: number, matchId: number): Promise<void> {
    const { onDeck, onField } = await this.repo.getFieldOccupants(fieldId)

    if (onDeck !== null) {
      throw new Error(`Field ${fieldId} is already occupied by match ${onDeck}`)
    }

    if (onField === null) {
      await this.repo.setFieldOnFieldMatch(fieldId, matchId)
    } else {
      await this.repo.setFieldOnDeckMatch(fieldId, matchId)
    }
  }

  async removeMatch (fieldId: number, matchId: number): Promise<void> {
    const { onDeck, onField } = await this.repo.getFieldOccupants(fieldId)

    if (onDeck === null && onField === null) {
      throw new Error(`Field ${fieldId} is not occupied`)
    }

    if (onDeck === matchId) {
      await this.repo.setFieldOnDeckMatch(fieldId, null)
    } else if (onField === matchId) {
      await this.repo.setFieldOnFieldMatch(fieldId, onDeck)
      await this.repo.setFieldOnDeckMatch(fieldId, null)
    } else {
      throw new Error(`Match ${matchId} is not on field ${fieldId}`)
    }
  }
}
