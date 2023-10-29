import { Injectable } from '@nestjs/common'
import { PublishService } from '../../old_utils/publish/publish.service'
import { EventStage } from './stage.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

export const EVENT_STAGE_KEY = 'eventStage'

@Injectable()
export class StagePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher(EVENT_STAGE_KEY)
  async publishStage (@Payload({}) stage: EventStage): Promise<void> {
    await this.publisher.broadcast(EVENT_STAGE_KEY, stage)
  }
}
