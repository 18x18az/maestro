import { Injectable, Logger } from '@nestjs/common'
import { FieldRepo } from './field.repo'
import { Field } from './field.interface'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)

  constructor (private readonly repo: FieldRepo) {}

  async initializeCompetitionFields (fields: string[]): Promise<void> {
    this.logger.log(`Initializing ${fields.length} fields with names ${fields.join(', ')}`)
    await this.repo.initializeCompetitionFields(fields)
  }

  async getCompetitionFields (): Promise<Field[]> {
    return await this.repo.getCompetitionFields()
  }
}
