import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { FieldState } from './fieldSet.interfaces'

function makeFieldSetTopic (uuid: string): string {
  return `fieldSet/${uuid}`
}

@Injectable()
export class FieldSetPublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('fieldSet/:uuid')
  async publishFieldSet (uuid: string, @Payload({}) state: FieldState): Promise<void> {
    const topic = makeFieldSetTopic(uuid)
    await this.publisher.broadcast(topic, state)
  }
}
