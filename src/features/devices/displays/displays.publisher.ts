import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { DisplayConfig } from './displays.interface'

const DISPLAYS_TOPIC = 'displays'

function makeDisplayTopic (uuid: string): string {
  return `${DISPLAYS_TOPIC}/${uuid}`
}

@Injectable()
export class DisplaysPublisher {
  constructor (private readonly publisher: PublishService) {}
  @Publisher(`${DISPLAYS_TOPIC}/:uuid`)
  async publishDisplay (uuid: string, @Payload({}) display: DisplayConfig): Promise<void> {
    const topic = makeDisplayTopic(uuid)
    await this.publisher.broadcast(topic, display)
  }
}
