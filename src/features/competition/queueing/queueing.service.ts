import { QualMatchBlockBroadcast } from '@/features/initial'
import { Injectable } from '@nestjs/common'
import { QueueingPublisher } from './queueing.publisher'

@Injectable()
export class QueueingService {
  currentBlock: QualMatchBlockBroadcast | null = null

  constructor (private readonly publisher: QueueingPublisher) {}

  async handleQualBlockUpdate (blocks: QualMatchBlockBroadcast[]): Promise<void> {
    await this.publishBlock()
  }

  private async publishBlock (): Promise<void> {
    await this.publisher.publishBlock(this.currentBlock as QualMatchBlockBroadcast)
  }
}
