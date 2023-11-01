import { ElimsMatch, MatchResult, TmService } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { FieldControlService } from '../field-control'

@Injectable()
export class ResultsInternal {
  private readonly logger = new Logger(ResultsInternal.name)

  constructor (
    private readonly tm: TmService,
    private readonly control: FieldControlService
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
  }
}
