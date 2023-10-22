import { Injectable, Logger } from '@nestjs/common'
import { FieldsPublisher } from './fields.publisher'
import { FieldInfo } from './fields.interface'
import { FieldRepo } from './field.repo'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)
  constructor (private readonly publisher: FieldsPublisher, private readonly repo: FieldRepo
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.broadcastFields()
  }

  async broadcastFields (): Promise<void> {
    const fields = await this.repo.getFields()
    this.logger.log('Broadcasting fields')
    await this.publisher.publishFields(fields)
  }

  async createFields (fields: FieldInfo[]): Promise<void> {
    await this.repo.clearFields()
    for (const field of fields) {
      await this.repo.createField(field)
    }
    await this.broadcastFields()
  }
}
