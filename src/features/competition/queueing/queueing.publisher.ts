import { QualMatchBlockBroadcast } from '@/features/initial'
import { PublishService } from '@/utils/publish/publish.service'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { QueuedMatch } from './queueing.interface'

export const CURRENT_BLOCK_CHANNEL = 'currentBlock'
export const QUEUED_MATCHES_CHANNEL = 'queuedMatches'

@Injectable()
export class QueueingPublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher(CURRENT_BLOCK_CHANNEL)
  async publishBlock (@Payload({}) block: QualMatchBlockBroadcast): Promise<void> {
    await this.publisher.broadcast(CURRENT_BLOCK_CHANNEL, block)
  }

  @Publisher(QUEUED_MATCHES_CHANNEL)
  async publishQueuedMatches (@Payload({ isArray: true, type: QueuedMatch }) matches: QueuedMatch[]): Promise<void> {
    await this.publisher.broadcast(QUEUED_MATCHES_CHANNEL, matches)
  }
}
