import { QualMatchBlockBroadcast } from '@/features/initial'
import { PublishService } from '@/utils/publish/publish.service'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'

export const CURRENT_BLOCK_CHANNEL = 'currentBlock'

@Injectable()
export class QueueingPublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher(CURRENT_BLOCK_CHANNEL)
  async publishBlock (@Payload({}) block: QualMatchBlockBroadcast): Promise<void> {
    await this.publisher.broadcast(CURRENT_BLOCK_CHANNEL, block)
  }
}
