import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { CURRENT_BLOCK_TOPIC, Match, MatchBlock, QUAL_BLOCK_TOPIC, QUAL_LIST_TOPIC } from './match.interface'

@Injectable()
export class MatchPublisher {
  constructor (
    private readonly publisher: PublishService
  ) {}

  async publishQuals (quals: Match[]): Promise<void> {
    await this.publisher.broadcast(QUAL_LIST_TOPIC, quals)
  }

  async publishQualBlocks (blocks: MatchBlock[]): Promise<void> {
    await this.publisher.broadcast(QUAL_BLOCK_TOPIC, blocks)
  }

  async publishCurrentBlock (block: MatchBlock | null): Promise<void> {
    await this.publisher.broadcast(CURRENT_BLOCK_TOPIC, block)
  }
}
