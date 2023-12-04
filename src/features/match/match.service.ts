import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Match, MatchStatus } from './match.interface'
import { MatchInternal } from './match.internal'
import { ElimsMatch } from '@/utils'

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

  async markForReplay (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} for replay`)
    await this.service.updateMatchStatus(match, MatchStatus.NEEDS_REPLAY)
    await this.service.removeFieldAssignment(match)
  }

  async markScored (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as scored`)
    await this.service.updateMatchStatus(match, MatchStatus.COMPLETE)
  }

  async reconcileQueued (queuedMatches: Match[]): Promise<void> {
    this.logger.log(`Reconciling ${queuedMatches.length} queued matches`)
    await this.service.reconcileQueued(queuedMatches)
  }

  async getUnqueuedMatches (): Promise<Match[]> {
    return await this.service.getUnqueuedMatches()
  }

  async markPlayed (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as played`)
    await this.service.updateMatchStatus(match, MatchStatus.SCORING)
  }

  async createElimsBlock (): Promise<number> {
    const id = await this.service.createElimsBlock()
    await this.service.loadElimsState()
    return id
  }

  async createElimsMatch (match: ElimsMatch): Promise<void> {
    await this.service.createElimsMatch(match)
  }

  async getMatch (match: number): Promise<Match | null> {
    return await this.service.getMatch(match)
  }

  async getMatchStatus (matchId: number): Promise<MatchStatus> {
    const match = await this.service.getMatch(matchId)

    if (match === null) {
      throw new BadRequestException(`Match ${matchId} not found`)
    }

    return match.status
  }

  async canBeQueued (matchId: number): Promise<boolean> {
    const status = await this.getMatchStatus(matchId)

    return status === MatchStatus.NOT_STARTED || status === MatchStatus.NEEDS_REPLAY
  }

  async canBeResolved (matchId: number): Promise<boolean> {
    const status = await this.getMatchStatus(matchId)

    return status === MatchStatus.QUEUED || status === MatchStatus.SCORING
  }

  async resolveMatch (matchId: number, resolution: MatchStatus): Promise<void> {
    if (!await this.canBeResolved(matchId)) {
      this.logger.warn(`Match ${matchId} cannot be resolved`)
      throw new BadRequestException(`Match ${matchId} cannot be resolved`)
    }

    switch (resolution) {
      case MatchStatus.COMPLETE:
        await this.markScored(matchId)
        break
      case MatchStatus.NEEDS_REPLAY:
        await this.markForReplay(matchId)
        break
      case MatchStatus.NOT_STARTED:
        await this.unmarkQueued(matchId)
        break
      default:
        throw new Error(`Invalid match resolution ${resolution}`)
    }
  }

  async canStartMatch (matchId: number): Promise<boolean> {
    const status = await this.getMatchStatus(matchId)

    return status === MatchStatus.QUEUED
  }
}
