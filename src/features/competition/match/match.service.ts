import { Injectable, Logger } from '@nestjs/common'
import { Match, SittingStatus } from './match.interface'
import { MatchInternal } from './match.internal'
import { ElimsMatch } from '@/utils'
import { DriverEndEvent, DriverEndResult } from '../competition-field/driver-end.event'

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)

  constructor (
    private readonly service: MatchInternal,
    private readonly driverEnd: DriverEndEvent
  ) {}

  onModuleInit (): void {
    this.driverEnd.registerOnComplete(async (data: DriverEndResult) => {
      await this.markPlayed(data.sittingId)
    })
  }

  // TODO these should be events
  async markQueued (sitting: number): Promise<void> {
    this.logger.log(`Marking sitting ID ${sitting} as queued`)
    await this.service.updateSittingStatus(sitting, SittingStatus.QUEUED)
  }

  async unmarkQueued (sitting: number): Promise<void> {
    this.logger.log(`Unmarking sitting ID ${sitting} as queued`)
    await this.service.updateSittingStatus(sitting, SittingStatus.NOT_STARTED)
  }

  async markScored (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as scored`)
    await this.service.updateSittingStatus(match, SittingStatus.COMPLETE)
  }

  async reconcileQueued (queuedMatches: Match[]): Promise<void> {
    this.logger.log(`Reconciling ${queuedMatches.length} queued matches`)
    await this.service.reconcileQueued(queuedMatches)
  }

  async markPlayed (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as played`)
    await this.service.updateSittingStatus(match, SittingStatus.SCORING)
  }

  async createElimsBlock (): Promise<number> {
    const id = await this.service.createElimsBlock()
    await this.service.loadElimsState()
    return id
  }

  async createElimsMatch (match: ElimsMatch): Promise<void> {
    await this.service.createElimsMatch(match)
  }

  // async getMatch (match: number): Promise<Match | null> {
  //   return await this.service.getMatch(match)
  // }

  // async getMatchStatus (matchId: number): Promise<MatchStatus> {
  //   const match = await this.service.getMatch(matchId)

  //   if (match === null) {
  //     throw new BadRequestException(`Match ${matchId} not found`)
  //   }

  //   return match.status
  // }

  // async canBeQueued (matchId: number): Promise<boolean> {
  //   const status = await this.getMatchStatus(matchId)

  //   return status === MatchStatus.NOT_STARTED || status === MatchStatus.NEEDS_REPLAY
  // }

  // async canBeResolved (matchId: number): Promise<boolean> {
  //   const status = await this.getMatchStatus(matchId)

  //   return status === MatchStatus.QUEUED || status === MatchStatus.SCORING
  // }

  async resolveMatch (matchId: number, resolution: SittingStatus): Promise<void> {
    // if (!await this.canBeResolved(matchId)) {
    //   this.logger.warn(`Match ${matchId} cannot be resolved`)
    //   throw new BadRequestException(`Match ${matchId} cannot be resolved`)
    // }

    switch (resolution) {
      case SittingStatus.COMPLETE:
        await this.markScored(matchId)
        break
      // case SittingStatus.NEEDS_REPLAY:
      //   await this.markForReplay(matchId)
      //   break
      case SittingStatus.NOT_STARTED:
        await this.unmarkQueued(matchId)
        break
      default:
        throw new Error(`Invalid match resolution ${resolution}`)
    }
  }

  // async canStartMatch (matchId: number): Promise<boolean> {
  //   const status = await this.getMatchStatus(matchId)

  //   return status === MatchStatus.QUEUED
  // }

  // async findByIdent (identifier: MatchIdentifier): Promise<Match> {
  //   return await this.service.findByIdent(identifier)
  // }
}
