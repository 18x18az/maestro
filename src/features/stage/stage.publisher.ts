import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { EventStage, STAGE_TOPIC } from './stage.interface'

@Injectable()
export class StagePublisher {
  constructor (
    private readonly publisher: PublishService
  ) {}

  async publishStage (stage: EventStage): Promise<void> {
    await this.publisher.broadcast(STAGE_TOPIC, { stage })
  }
}
