import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchScorePublisher } from './matchScore.publisher'
import { MatchScoreDatabase } from './matchScore.repo'
import { MatchScoreUpdate } from './matchScore.interface'

@Injectable()
export class MatchScoreService {
  constructor (
    private readonly publisher: MatchScorePublisher,
    private readonly database: MatchScoreDatabase
  ) {}

  private readonly logger = new Logger(MatchScoreService.name)

  async updateScore (
    matchId: number,
    partialScore: MatchScoreUpdate
  ): Promise<void> {
    this.logger.log(`Updating score for Match.${matchId}`)
    if ('locked' in partialScore) {
      this.logger.warn(
        `Attempted to modify lock status of MatchScore.${matchId} from incorrect route`
      )
      throw new BadRequestException()
    }
    if (this.database.getLockState(matchId)) {
      this.logger.warn(
        `MatchScore.${matchId} is locked`
      )
      throw new BadRequestException()
    }
    await this.database.updateScore(matchId, partialScore)
  }

  async saveScore (matchId: number): Promise<void> {
    this.logger.log(`Saving score for Match.${matchId} to database`)
    if (!this.database.getLockState(matchId)) {
      this.logger.warn(
        `MatchScore.${matchId} is not locked`
      )
      throw new BadRequestException()
    }
    await this.database.saveScore(matchId)
  }

  async lockScore (matchId: number): Promise<void> {
    this.logger.log(`Locking score for Match.${matchId}`)
    await this.database.lockScore(matchId)
  }

  async unlockScore (matchId: number): Promise<void> {
    this.logger.log(`Unlocking score for Match.${matchId}`)
    await this.database.unlockScore(matchId)
  }
}
