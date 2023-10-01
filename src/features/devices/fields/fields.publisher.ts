import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'

export enum FieldState {
  DRIVER = 'DRIVER',
  AUTO = 'AUTO',
  DISABLED = 'DISABLED'
}

interface FieldInfo {
  state: FieldState
  endTime?: Date
}

function makeFieldTopic (fieldId: string): string {
  return `fields/${fieldId}`
}

@Injectable()
export class FieldsPublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('fields/:fieldId')
  async publishField (fieldId: string, @Payload({}) info: FieldInfo): Promise<void> {
    const topic = makeFieldTopic(fieldId)
    await this.publisher.broadcast(topic, info)
  }
}
