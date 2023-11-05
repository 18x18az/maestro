import { Injectable } from '@nestjs/common'
import { PublishService } from '../publish'

const STATUS_TOPIC = 'status'

@Injectable()
export class StatusPublisher {
  constructor (
    private readonly publisher: PublishService
  ) { }

  async publishStatus (topic: string, status: string, extra?: object): Promise<void> {
    await this.publisher.broadcast(`${STATUS_TOPIC}/${topic}`, { status, ...extra })
  }
}
