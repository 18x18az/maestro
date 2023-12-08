import { ElimsMatch, MatchResult, PublishService, TmService } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { EventStage, StageService } from '../stage'
import { MatchService } from '../competition/match'
import { CompetitionControlService } from '../competition/competition/competition.service'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)
  private readonly savedResults: string[] = []

  constructor (
    private readonly tm: TmService,
    private readonly control: CompetitionControlService,
    private readonly stage: StageService,
    private readonly matches: MatchService,
    private readonly publisher: PublishService
  ) { }

  @Cron('*/10 * * * * *')
  async handleCron (): Promise<void> {
    if (this.stage.getStage() === EventStage.WAITING_FOR_TEAMS) {
      return
    }

    const results = await this.tm.getMatchResults()

    if (results.matches !== null) {
      await this.handleMatches(results.matches)
    }

    if (results.results !== null) {
      await this.handleResults(results.results)
    }
  }

  private async handleResults (results: MatchResult[]): Promise<void> {
    for (const result of results) {
      const key = JSON.stringify(result.identifier)
      if (this.savedResults.includes(key)) continue

      this.logger.log(`Result for match ${JSON.stringify(result.identifier)}`)
      await this.control.handleMatchResult(result)
      this.savedResults.push(key)
    }
  }

  private async handleMatches (matches: ElimsMatch[]): Promise<void> {
    if (matches.length === 0) {
      return
    }
    const currentStage = this.stage.getStage()
    if (currentStage === EventStage.ALLIANCE_SELECTION) {
      this.logger.log('Matches received while alliance selection in process, alliance selection over')
      await this.matches.createElimsBlock()
      await this.stage.advanceStage()
    }
    for (const match of matches) {
      await this.matches.createElimsMatch(match)
    }
  }
}
