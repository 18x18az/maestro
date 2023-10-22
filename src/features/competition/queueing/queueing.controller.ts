import { QUAL_BLOCK_LIST_CHANNEL, QualMatchBlockBroadcast } from '@/features/initial'
import { Controller } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { QueueingService } from './queueing.service'

@Controller('queueing')
export class QueueingController {
  constructor (private readonly service: QueueingService) {}
  @EventPattern(QUAL_BLOCK_LIST_CHANNEL)
  async handleQualBlocks (blocks: QualMatchBlockBroadcast[]): Promise<void> {
    await this.service.handleQualBlockUpdate(blocks)
  }
}
