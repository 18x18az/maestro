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
}
