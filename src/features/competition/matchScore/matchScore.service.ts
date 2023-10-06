import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { MatchScorePublisher } from './matchScore.publisher'
import { MatchScoreDatabase } from './matchScore.repo'
import { MATCH_ROUND, MatchScoreUpdate } from './matchScore.interface'
import { validate } from 'class-validator'
import { QualMatch } from 'src/features/initial/qual-schedule/qual-schedule.interface'

@Injectable()
export class MatchScoreService {
  constructor (
    private readonly publisher: MatchScorePublisher,
    private readonly database: MatchScoreDatabase
  ) {}

  private readonly logger = new Logger(MatchScoreService.name)

  private async publishSavedScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    const prismaScore = await this.database.getFinalMatchScoreInPrisma(matchId)
    if (prismaScore === null) throw new InternalServerErrorException()
    await this.publisher.publishFinalScore(matchId, round, prismaScore)
  }

  private async publishWorkingScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    // @todo should remove id and round
    await this.publisher.publishWorkingScore(
      matchId,
      round,
      this.database.getWorkingScore(matchId)
    )
  }

  async updateScore (
    matchId: number,
    partialScore: MatchScoreUpdate,
    round: MATCH_ROUND
  ): Promise<void> {
    console.log(partialScore)
    this.logger.log(`Updating score for Match.${matchId}`)
    if ('locked' in partialScore) {
      this.logger.warn(
        `Attempted to modify lock status of MatchScore.${matchId} from incorrect route`
      )
      throw new BadRequestException()
    }
    if (this.database.getLockState(matchId)) {
      this.logger.warn(`MatchScore.${matchId} is locked`)
      throw new BadRequestException()
    }
    await this.database.updateScore(matchId, partialScore)
    await this.publishWorkingScore(matchId, round)
  }

  async saveScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    this.logger.log(`Saving score for Match.${matchId} to database`)
    try {
      await validate(this.database.getWorkingScore(matchId), {
        groups: [`meta.${round}`],
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true
      })
    } catch {
      this.logger.warn(`Metadata check for Match.${matchId} failed`)
      throw new BadRequestException()
    }
    if (!this.database.getLockState(matchId)) {
      this.logger.warn(`MatchScore.${matchId} is not locked`)
      throw new BadRequestException()
    }
    await this.database.saveScore(matchId)
    await this.publishSavedScore(matchId, round)
  }

  async lockScore (matchId: number): Promise<void> {
    this.logger.log(`Locking score for Match.${matchId}`)
    await this.database.lockScore(matchId)
  }

  async unlockScore (matchId: number): Promise<void> {
    this.logger.log(`Unlocking score for Match.${matchId}`)
    await this.database.unlockScore(matchId)
  }

  async handleMatches (matches: Array<{ id: number, round: MATCH_ROUND }>): Promise<void> {
    await Promise.all([
      Promise.allSettled(
        matches.map(async ({ id, round }) => await this.publishSavedScore(id, round).catch())
      ),
      this.database
        .hydrateInMemoryDB(
          matches.map(({ id, round }) => {
            return { matchId: id, round }
          })
        )
        .then(
          async () =>
            await Promise.all(
              matches.map(async ({ id, round }) => await this.publishWorkingScore(id, round))
            )
        )
    ])
  }

  async handleQualMatches (matches: QualMatch[]): Promise<void> {
    await this.handleMatches(matches.map(({ id }) => { return { id, round: MATCH_ROUND.QUALIFICATION } }))
  }
}
