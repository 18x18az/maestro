import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { MatchScoreService } from './matchScore.service'
import { MatchScoreUpdate } from './matchScore.interface'

// matches/:round/:number/:sitting/score (e.g. matches/qualification/27/1 or matches/final/1/2) -
// takes a Partial of the raw match scores interface and
// uses that to update the working match score for the given match,
// then publishes the updated value to the working topic

// matches/:round/:number/:sitting/save -
// When called, it stores the raw score in the database.
// Information such as DQ should be stored as their own columns,
// but alliance scores should be stored as a giant JSON string
// (will make it easier to migrate between seasons).
// It should then publish that saved value to the saved match topic.
interface MatchScoreParams {
  matchId: string
}

@Controller('match')
export class MatchScoreController {
  constructor (private readonly service: MatchScoreService) {}

  @Post(':matchId/score')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipUndefinedProperties: true, forbidUnknownValues: true, transform: true }))
  async updateScore (
    @Param() params: MatchScoreParams,
      @Body() partialScore: MatchScoreUpdate
  ): Promise<void> {
    await this.service.updateScore(getMatchId(params), partialScore)
  }

  @Post(':matchId/save')
  async saveScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.saveScore(getMatchId(params))
  }

  @Post(':matchId/lock')
  async lockScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.lockScore(getMatchId(params))
  }

  @Post(':matchId/unlock')
  async unlockScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.unlockScore(getMatchId(params))
  }
}

const logger = new Logger(MatchScoreController.name)
function getMatchId (params: MatchScoreParams): number {
  const matchId = Number(params.matchId)
  if (!Number.isSafeInteger(matchId) || matchId < 0) {
    logger.warn(`Received Malformed matchID: ${matchId}`)
    throw new BadRequestException('matchId must be a positive integer')
  }
  return matchId
}
