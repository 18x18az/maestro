import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { DisplayedResults, StreamDisplayStage } from './stream.interface'

@Injectable()
export class StreamPublisher {
  constructor (
    private readonly publisher: PublishService
  ) {}

  async publishStagedResults (results: DisplayedResults | null): Promise<void> {
    await this.publisher.broadcast('results', results)
  }

  async publishDisplayStage (stage: StreamDisplayStage): Promise<void> {
    await this.publisher.broadcast('displayStage', { stage })
  }
}
