import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { Field } from './field.interface'

@Injectable()
export class FieldPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishFields (fields: Field[]): Promise<void> {
    await this.publisher.broadcast('fields', fields)
  }
}
