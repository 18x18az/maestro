import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { DisplayConfig } from './display.interface'
import { PublishService } from '@/utils'

const DISPLAYS_TOPIC = 'displays'

function makeDisplayTopic (uuid: string): string {
  return `${DISPLAYS_TOPIC}/${uuid}`
}

@Injectable()
export class DisplayPublisher {
  constructor (private readonly publisher: PublishService) {}
  @Publisher(`${DISPLAYS_TOPIC}/:uuid`)
  async publishDisplay (uuid: string, @Payload({}) display: DisplayConfig): Promise<void> {
    const topic = makeDisplayTopic(uuid)
    await this.publisher.broadcast(topic, display)
  }

  @Publisher(DISPLAYS_TOPIC)
  async publishAllDisplays (@Payload({ isArray: true, type: DisplayConfig }) displays: DisplayConfig[]): Promise<void> {
    await this.publisher.broadcast(DISPLAYS_TOPIC, displays)
  }
}
