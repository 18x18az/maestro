import { Injectable } from '@nestjs/common'
import { PublishService } from '@/utils'

@Injectable()
export class CompetitionControlPublisher {
  constructor (private readonly publisher: PublishService) { }

  public async publishLiveField (fieldId: number | null): Promise<void> {
    await this.publisher.broadcast('liveField', { fieldId })
  }

  public async publishOnDeckField (fieldId: number | null): Promise<void> {
    await this.publisher.broadcast('onDeckField', { fieldId })
  }
}
