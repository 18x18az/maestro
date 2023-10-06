import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { MatchScoreService } from './matchScore.service'
import { MATCH_ROUND, MatchScoreUpdate } from './matchScore.interface'
import { IsEnum, IsInt, IsPositive } from 'class-validator'
import { Transform } from 'class-transformer'
import { EventPattern } from '@nestjs/microservices'
import { QualMatch } from 'src/features/initial/qual-schedule/qual-schedule.interface'

class MatchScoreParams {
  @IsPositive()
  @IsInt()
  @Transform(({ value }) => Number(value))
    matchId: number

  @IsEnum(MATCH_ROUND)
    type: MATCH_ROUND
}

// undocumented regex syntax, may break some day: https://stackoverflow.com/a/71671007
@Controller('match/:type(qual|elim)/:matchId')
export class MatchScoreController {
  constructor (private readonly service: MatchScoreService) {}

  @Post('score')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true, transform: true }))
  async updateScore (
    @Param() params: MatchScoreParams,
      @Body() partialScore: MatchScoreUpdate
  ): Promise<void> {
    await this.service.updateScore(params.matchId, partialScore, params.type)
  }

  @Post('save')
  async saveScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.saveScore(params.matchId, params.type)
  }

  @Post('lock')
  async lockScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.lockScore(params.matchId)
  }

  @Post('unlock')
  async unlockScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.unlockScore(params.matchId)
  }

  @EventPattern('qualification/matches')
  async handleQualMatches (matches: QualMatch[]): Promise<void> {
    await this.service.handleQualMatches(matches)
  }
}
