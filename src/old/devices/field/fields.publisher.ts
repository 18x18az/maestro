import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from '@/old_utils/publish/publish.service'
import { FieldInfoBroadcast } from './fields.interface'

function makeFieldTopic (fieldId: string): string {
  return `fields/${fieldId}`
}

@Injectable()
export class FieldsPublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('fields/:fieldId')
  async publishField (fieldId: string, @Payload({}) info: FieldInfoBroadcast): Promise<void> {
    const topic = makeFieldTopic(fieldId)
    await this.publisher.broadcast(topic, info)
  }

  @Publisher('fields')
  async publishFields (@Payload({}) info: FieldInfoBroadcast[]): Promise<void> {
    await this.publisher.broadcast('fields', info)
  }
}
