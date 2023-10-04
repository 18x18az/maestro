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
    if ('locked' in partialScore) {
      this.logger.log(
        `Attempted from to modify lock status of MatchScore.${matchId} from incorrect route`
      )
      throw new BadRequestException()
    }
    await this.database.updateScore(matchId, partialScore)
  }

  async saveScore (matchId: number): Promise<void> {
    await this.database.saveScore(matchId)
  }

  async lockScore (matchId: number): Promise<void> {
    await this.database.lockScore(matchId)
  }

  async unlockScore (matchId: number): Promise<void> {
    await this.database.unlockScore(matchId)
  }
}
