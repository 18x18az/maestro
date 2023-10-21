import { PublishService } from '@/utils/publish/publish.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SetupPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishEventName (eventName: string): Promise<void> {
    await this.publisher.broadcast('eventName', eventName)
  }

  async publishReadyForTeams (ready: boolean): Promise<void> {
    await this.publisher.broadcast('readyForTeams', ready)
  }
}
