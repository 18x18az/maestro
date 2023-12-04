import { ElimsMatch, MatchResult, TmService } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { EventStage, StageService } from '../stage'
import { MatchService } from '../competition'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)

  constructor (
    private readonly tm: TmService,
    // private readonly control: FieldControlService,
    private readonly stage: StageService,
    private readonly matches: MatchService
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
    // await this.control.handleMatchResults(results)
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
