import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { createHash } from 'crypto'
import { MatchResultContext, MatchResultEvent } from '../competition/match/match-result.event'
import { TmService } from '../../utils/tm/tm.service'
import { MatchService } from '../competition/match/match.service'
import { ElimsMatch, MatchResult } from '../../utils/tm/tm.interface'
import { StageService } from '../stage/stage.service'
import { EventStage } from '../stage/stage.interface'
import { CompetitionControlService } from '../competition/competition/competition.service'
import { OnLiveEvent } from '../competition/competition/on-live.event'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)
  private readonly savedResults: string[] = []

  private displayedMatchId: number | null = null
  private nextMatchId: number | null = null

  private lastResultHash = ''
  private lastMatchHash = ''

  private readonly resultCache: Map<string, [number, number]> = new Map()

  constructor (
    private readonly tm: TmService,
    private readonly stage: StageService,
    private readonly matches: MatchService,
    private readonly resultEvent: MatchResultEvent,
    private readonly competition: CompetitionControlService,
    private readonly onLive: OnLiveEvent,
    private readonly stageService: StageService
  ) { }

  onModuleInit (): void {
    this.resultEvent.registerOnComplete(this.handleResultComplete.bind(this))
    this.onLive.registerOnComplete(this.promoteResults.bind(this))
  }

  async handleResultComplete (match: MatchResultContext): Promise<void> {
    if (await this.competition.getLiveField() === null) {
      this.nextMatchId = match.matchId
    } else {
      this.displayedMatchId = match.matchId
    }
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

  async handleResults (results: MatchResult[]): Promise<void> {
    if (results.length === 0) return
    const resultsHash = createHash('sha256').update(JSON.stringify(results)).digest('hex')
    if (resultsHash === this.lastResultHash) return

    this.lastResultHash = resultsHash

    const updates = results.map(async result => {
      const { identifier, redScore, blueScore } = result
      const identString = `${identifier.round}-${identifier.contest}-${identifier.match}`

      const cached = this.resultCache.get(identString)
      if (cached !== undefined && cached[0] === redScore && cached[1] === blueScore) return
      this.resultCache.set(identString, [redScore, blueScore])

      const saved = await this.matches.getMatchScore(identifier)
      if (saved !== null && saved.redScore === redScore && saved.blueScore === blueScore) return

      await this.resultEvent.execute({ identifier, redScore, blueScore })
    })

    await Promise.all(updates)
  }

  async handleMatches (matches: ElimsMatch[]): Promise<void> {
    if (matches.length === 0) return
    const matchHash = createHash('sha256').update(JSON.stringify(matches)).digest('hex')
    if (matchHash === this.lastMatchHash) return

    const currentStage = await this.stageService.getStage()

    if (currentStage === EventStage.ALLIANCE_SELECTION) await this.stageService.setStage(EventStage.ELIMS)

    this.lastMatchHash = matchHash
    console.log('updated matches')
  }

  @Cron('*/10 * * * * *')
  async handleCron (): Promise<void> {
    const stage = await this.stage.getStage()
    if (stage === EventStage.CHECKIN) return

    const { results, matches } = await this.tm.getMatchResults()

    await this.handleResults(results)

    if (stage === EventStage.QUALIFICATIONS) return

    await this.handleMatches(matches)
  }
}
