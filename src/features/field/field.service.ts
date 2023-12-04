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

  async publishFields (): Promise<void> {
    const fieldInfo = await this.getAllFields()
    await this.publisher.publishFields(fieldInfo)
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.publishFields()
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

  async getAllFields (): Promise<Field[]> {
    return await this.repo.getAllFields()
  }

  async getFieldName (fieldId: number): Promise<string> {
    return await this.repo.getFieldName(fieldId)
  }

  async addField (): Promise<void> {
    this.logger.log('Adding field')
    await this.repo.addField()
    await this.publishFields()
  }

  async setName (id: number, name: string): Promise<void> {
    this.logger.log(`Setting field ${id} name to ${name}`)
    await this.repo.setName(id, name)
    await this.publishFields()
  }

  async deleteField (id: number): Promise<void> {
    this.logger.log(`Deleting field ${id}`)
    await this.repo.deleteField(id)
    await this.publishFields()
  }

  async isEnabled (id: number): Promise<boolean> {
    return await this.repo.isEnabled(id)
  }

  async getField (id: number): Promise<Field> {
    return await this.repo.get(id)
  }
}
