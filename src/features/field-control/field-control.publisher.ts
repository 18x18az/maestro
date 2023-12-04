import { Injectable } from '@nestjs/common'
import { PublishService } from '../../utils'
import { FieldControlStatus } from './field-control.interface'

@Injectable()
export class FieldControlPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishFieldControlCreatedEvent (fieldId: number, status: FieldControlStatus): Promise<void> {
    const topic = `fieldControl/${fieldId}`
    await this.publisher.broadcast(topic, status)
  }
}
