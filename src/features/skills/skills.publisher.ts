import { Injectable } from '@nestjs/common'
import { PublishService } from '../../utils'

@Injectable()
export class SkillsPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishStopTime (fieldId: number, stopTime: number | null): Promise<void> {
    const topic = `stopTime/${fieldId}`
    await this.publisher.broadcast(topic, { time: stopTime })
  }
}
