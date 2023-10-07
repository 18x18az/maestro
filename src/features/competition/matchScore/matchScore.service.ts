import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { MatchScorePublisher } from './matchScore.publisher'
import { MatchScoreDatabase } from './matchScore.repo'
import { MATCH_ROUND, MatchScoreUpdate, MatchScoreWithDetails } from './matchScore.interface'
import { QualMatch } from 'src/features/initial/qual-schedule/qual-schedule.interface'

@Injectable()
export class MatchScoreService {
  constructor (
    private readonly publisher: MatchScorePublisher,
    private readonly database: MatchScoreDatabase
  ) {}

  private readonly logger = new Logger(MatchScoreService.name)

  private async publishSavedScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    const prismaScore = await this.database.getFinalMatchScoreFromPrismaWithDetails(matchId)
    if (prismaScore === null) throw new InternalServerErrorException()
    await this.publisher.publishFinalScore(matchId, round, prismaScore)
  }

  private async publishWorkingScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    const { red, redScore, blue, blueScore, autonWinner, metadata, number, locked } = this.database.getWorkingScore(matchId)
    const cleansedScore = {
      red, redScore, blue, blueScore, autonWinner, metadata, number, locked
    }
    await this.publisher.publishWorkingScore(
      matchId,
      round,
      cleansedScore as MatchScoreWithDetails
    )
  }

  /** @throws if cached match does not exist */
  private checkMatchExists (matchId: number): void {
    if (this.database.getWorkingScore(matchId) === undefined) {
      this.logger.warn(`MatchScore.${matchId} does not exist`)
      throw new NotFoundException(`MatchScore.${matchId} does not exist`)
    }
  }

  /** @throws if cached match does not match round */
  private checkRound (matchId: number, round: MATCH_ROUND): void {
    if (this.database.getWorkingScore(matchId).round !== round) {
      this.logger.warn(`Attempted to modify ${round}s.MatchScore.${matchId} from /match/${round}/**`)
      throw new BadRequestException()
    }
  }

  async updateScore (
    matchId: number,
    partialScore: MatchScoreUpdate,
    round: MATCH_ROUND
  ): Promise<void> {
    this.logger.log(`Updating score for Match.${matchId}`)
    if ('locked' in partialScore) {
      this.logger.warn(
        `Attempted to modify lock status of MatchScore.${matchId} from incorrect route`
      )
      throw new BadRequestException()
    }
    this.checkMatchExists(matchId)
    this.checkRound(matchId, round)
    if (this.database.getLockState(matchId)) {
      this.logger.warn(`MatchScore.${matchId} is locked`)
      throw new BadRequestException()
    }
    await this.database.updateScore(matchId, partialScore)
    await this.publishWorkingScore(matchId, round)
  }

  async saveScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    this.logger.log(`Saving score for Match.${matchId} to database`)
    this.checkMatchExists(matchId)
    this.checkRound(matchId, round)
    if (!this.database.getLockState(matchId)) {
      this.logger.warn(`MatchScore.${matchId} is not locked`)
      throw new BadRequestException()
    }
    await this.database.saveScore(matchId)
    await this.publishSavedScore(matchId, round)
  }

  async lockScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    this.logger.log(`Locking score for Match.${matchId}`)
    this.checkMatchExists(matchId)
    this.checkRound(matchId, round)
    await this.database.lockScore(matchId)
  }

  async unlockScore (matchId: number, round: MATCH_ROUND): Promise<void> {
    this.logger.log(`Unlocking score for Match.${matchId}`)
    this.checkMatchExists(matchId)
    this.checkRound(matchId, round)
    await this.database.unlockScore(matchId)
  }

  async handleMatches (matches: Array<QualMatch & { round: MATCH_ROUND }>): Promise<void> {
    await Promise.all([
      Promise.allSettled(
        matches.map(async ({ id, round }) => await this.publishSavedScore(id, round).catch())
      ),
      this.database
        .hydrateInMemoryDB(
          matches.map((details) => {
            return { matchId: details.id, round: details.round, blue: details.blue, red: details.red, number: details.number }
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
    this.logger.log(`Handling ${matches.length} QualMatches`)
    await this.handleMatches(matches.map((match) => { return { ...match, round: MATCH_ROUND.QUALIFICATION } }))
  }
}
