import { Injectable, Logger } from '@nestjs/common'
import { MatchResultEvent, MatchResultPayload } from '../competition/match/match-result.event'
import { CompetitionControlService } from '../competition/competition/competition.service'
import { OnLiveEvent } from '../competition/competition/on-live.event'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)

  private displayedMatchId: number | null = null
  private nextMatchId: number | null = null

  constructor (
    private readonly resultEvent: MatchResultEvent,
    private readonly competition: CompetitionControlService,
    private readonly onLive: OnLiveEvent
  ) { }

  onModuleInit (): void {
    this.resultEvent.registerOnComplete(this.handleResultComplete.bind(this))
    this.onLive.registerOnComplete(this.promoteResults.bind(this))
  }

  async handleResultComplete (match: MatchResultPayload): Promise<void> {
    if (await this.competition.getLiveField() === null) {
      this.nextMatchId = match.matchId
    } else {
      this.displayedMatchId = match.matchId
    }
  }

  clearResults (): void {
    this.displayedMatchId = null
  }

  promoteResults (): void {
    this.displayedMatchId = this.nextMatchId
    this.nextMatchId = null
  }

  getDisplayedMatchId (): number | null {
    return this.displayedMatchId
  }

  getNextMatchId (): number | null {
    return this.nextMatchId
  }
}
