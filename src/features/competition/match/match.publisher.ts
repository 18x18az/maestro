import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { Match } from './match.interface'

@Injectable()
export class MatchPublisher {
  constructor (
    private readonly publisher: PublishService
  ) {}

  async publishMatchlist (matches: Match[]): Promise<void> {
    await this.publisher.broadcast('matchlist', matches)
  }

  async publishUnqueuedMatches (matches: Match[]): Promise<void> {
    await this.publisher.broadcast('unqueued', matches)
  }

  async publishBlock (block: string | null): Promise<void> {
    await this.publisher.broadcast('block', { block })
  }
}
