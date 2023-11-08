import { ElimsMatch, MatchResult, TmService } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { FieldControlService } from '../field-control'
import { EventStage, StageService } from '../stage'
import { MatchService } from '../match'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)

  constructor (
    private readonly tm: TmService,
    private readonly control: FieldControlService,
    private readonly stage: StageService,
    private readonly matches: MatchService
  ) { }

  @Cron('*/10 * * * * *')
  async handleCron (): Promise<void> {
    const results = await this.tm.getMatchResults()

    if (results.matches !== null) {
      await this.handleMatches(results.matches)
    }

    if (results.results !== null) {
      await this.handleResults(results.results)
    }
  }

  private async handleResults (results: MatchResult[]): Promise<void> {
    await this.control.handleMatchResults(results)
  }

  private async handleMatches (matches: ElimsMatch[]): Promise<void> {
    if (matches.length === 0) {
      return
    }
    const currentStage = this.stage.getStage()
    if (currentStage === EventStage.ALLIANCE_SELECTION) {
      this.logger.log('Matches received while alliance selection in process, alliance selection over')
      await this.stage.advanceStage()
    }
  }
}
