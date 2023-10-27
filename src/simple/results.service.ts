import { Injectable, Logger } from '@nestjs/common'
import { ContextfulMatchResult, MatchResult } from './simple.interface'
import { SimplePublisher } from './simple.publisher'
import { SimpleRepo } from './simple.repo'

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name)

  private stagedResult: ContextfulMatchResult | null = null

  constructor (private readonly publisher: SimplePublisher, private readonly repo: SimpleRepo) {}

  async publishResults (): Promise<void> {
    if (this.stagedResult === null) {
      this.logger.log('No match results to display, publishing blank')
      await this.publisher.publishMatchResult(null)
      return
    }

    this.logger.log(`Publishing results for ${this.stagedResult.round}-${this.stagedResult.match}`)
    await this.publisher.publishMatchResult(this.stagedResult)

    this.stagedResult = null
  }

  async update (result: MatchResult): Promise<void> {
    this.logger.log(`Most recent match results are for ${result.round}-${result.match}`)
    const context = await this.repo.getMatchTeams({ round: result.round, match: result.match, sitting: result.sitting, replay: 0 })
    this.stagedResult = { ...result, ...context }
  }

  async clearScore (): Promise<void> {
    this.logger.log('Clearing match results')
    await this.publisher.publishMatchResult(null)
  }
}
