import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { MatchScoreService } from './matchScore.service'
import { ElimMatchScoreUpdate, MATCH_ROUND, QualMatchScoreUpdate } from './matchScore.interface'
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
function makeRoute (endpoint: string, round: MATCH_ROUND[] = [MATCH_ROUND.QUALIFICATION, MATCH_ROUND.ELIMINATION]): `:type(${string})/:matchId/${typeof endpoint}` {
  // undocumented regex syntax, may break some day: https://stackoverflow.com/a/71671007
  return `:type(${round.join('|')})/:matchId/${endpoint}`
}
@Controller('match')
export class MatchScoreController {
  constructor (private readonly service: MatchScoreService) {}

  @Post(makeRoute('score', [MATCH_ROUND.QUALIFICATION]))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true, transform: true }))
  async updateQualScore (
    @Param() params: MatchScoreParams,
      @Body() partialScore: QualMatchScoreUpdate
  ): Promise<void> {
    await this.service.updateScore(params.matchId, partialScore, params.type)
  }

  @Post(makeRoute('score', [MATCH_ROUND.ELIMINATION]))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true, transform: true }))
  async updateElimScore (
    @Param() params: MatchScoreParams,
      @Body() partialScore: ElimMatchScoreUpdate
  ): Promise<void> {
    await this.service.updateScore(params.matchId, partialScore, params.type)
  }

  @Post(makeRoute('save'))
  async saveScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.saveScore(params.matchId, params.type)
  }

  @Post(makeRoute('lock'))
  async lockScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.lockScore(params.matchId, params.type)
  }

  @Post(makeRoute('unlock'))
  async unlockScore (@Param() params: MatchScoreParams): Promise<void> {
    await this.service.unlockScore(params.matchId, params.type)
  }

  @EventPattern('qualification/matches')
  async handleQualMatches (matches: QualMatch[]): Promise<void> {
    await this.service.handleQualMatches(matches)
  }
}
