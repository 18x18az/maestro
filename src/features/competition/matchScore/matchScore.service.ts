import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
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

  private async publishSavedScore (matchId: number): Promise<void> {
    const prismaScore = await this.database.getFinalMatchScoreInPrisma(matchId)
    if (prismaScore === null) throw new InternalServerErrorException()
    await this.publisher.publishFinalScore(matchId, prismaScore)
  }

  private async publishWorkingScore (matchId: number): Promise<void> {
    // @todo should remove id and round
    await this.publisher.publishWorkingScore(matchId, this.database.getWorkingScore(matchId))
  }

  async updateScore (
    matchId: number,
    partialScore: MatchScoreUpdate
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
      this.logger.warn(
        `MatchScore.${matchId} is locked`
      )
      throw new BadRequestException()
    }
    await this.database.updateScore(matchId, partialScore)
    await this.publishWorkingScore(matchId)
  }

  async saveScore (matchId: number, matchType: MATCH_ROUND): Promise<void> {
    this.logger.log(`Saving score for Match.${matchId} to database`)
    try {
      await validate(this.database.getWorkingScore(matchId), { groups: [`meta.${matchType}`], whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true })
    } catch {
      this.logger.warn(`Metadata check for Match.${matchId} failed`)
      throw new BadRequestException()
    }
    if (!this.database.getLockState(matchId)) {
      this.logger.warn(
        `MatchScore.${matchId} is not locked`
      )
      throw new BadRequestException()
    }
    await this.database.saveScore(matchId)
    await this.publishSavedScore(matchId)
  }

  async lockScore (matchId: number): Promise<void> {
    this.logger.log(`Locking score for Match.${matchId}`)
    await this.database.lockScore(matchId)
  }

  async unlockScore (matchId: number): Promise<void> {
    this.logger.log(`Unlocking score for Match.${matchId}`)
    await this.database.unlockScore(matchId)
  }

  async handleQualMatches (matches: QualMatch[]): Promise<void> {
    await Promise.all(
      [
        Promise.allSettled(matches.map(async ({ id }) => await this.publishSavedScore(id).catch())),
        (async () => {
          await this.database.hydrateInMemoryDB(matches.map(({ id }) => { return { matchId: id, round: 'qual' } }))
          await Promise.all(matches.map(async ({ id }) => await this.publishWorkingScore(id).catch()))
        })()
      ]
    )
  }
}
