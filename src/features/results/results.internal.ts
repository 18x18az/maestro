import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { EventStage, StageService } from '../stage'
import { createHash } from 'crypto'
import { MatchService } from '../competition/match'
import { MatchResultEvent } from '../competition/match/match-result.event'
import { ElimsMatch, MatchResult, TmService } from '../../utils/tm'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)
  private readonly savedResults: string[] = []

  private lastResultHash = ''
  private lastMatchHash = ''

  private readonly resultCache: Map<string, [number, number]> = new Map()

  constructor (
    private readonly tm: TmService,
    private readonly stage: StageService,
    private readonly matches: MatchService,
    private readonly resultEvent: MatchResultEvent
  ) { }

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
