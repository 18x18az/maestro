import { Controller } from '@nestjs/common'
import { QUEUED_MATCHES_CHANNEL } from '../queueing/queueing.publisher'
import { EventPattern } from '@nestjs/microservices'
import { FieldSetService } from './fieldSet.service'
import { QueuedMatch } from '../queueing'

@Controller()
export class FieldSetController {
  constructor (private readonly service: FieldSetService) {}

  @EventPattern(QUEUED_MATCHES_CHANNEL)
  async handleQueuedMatchesUpdate (matches: QueuedMatch[]): Promise<void> {
    await this.service.handleQueuedMatchesUpdate(matches)
  }
}
