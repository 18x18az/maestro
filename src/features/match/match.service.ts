import { Injectable, Logger } from '@nestjs/common'
import { Match, MatchStatus } from './match.interface'
import { MatchInternal } from './match.internal'

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)

  constructor (
    private readonly service: MatchInternal
  ) {}

  async markQueued (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as queued`)
    await this.service.updateMatchStatus(match, MatchStatus.QUEUED)
  }

  async unmarkQueued (match: number): Promise<void> {
    this.logger.log(`Unmarking match ID ${match} as queued`)
    await this.service.updateMatchStatus(match, MatchStatus.NOT_STARTED)
  }

  async reconcileQueued (queuedMatches: Match[]): Promise<void> {
    this.logger.log(`Reconciling ${queuedMatches.length} queued matches`)
    await this.service.reconcileQueued(queuedMatches)
  }
}
