import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsPositive, Max, Min } from 'class-validator'
import { MATCH_ALLIANCE, MATCH_ROUND } from './local.dto'

export class SpecificPortionParams {
  @IsPositive()
  @IsInt()
  @Transform(({ value }) => Number(value))
    matchId: number
}

export class SpecificPortionAllianceParams extends SpecificPortionParams {
  @IsEnum(MATCH_ALLIANCE)
    color: MATCH_ALLIANCE
}

export class SpecificPortionTeamParams extends SpecificPortionAllianceParams {
  @IsPositive()
  @Max(1)
  @Min(0)
  @IsInt()
  @Transform(({ value }) => Number(value))
    teamNumber: 0 | 1
}

export class GenericMatchParams extends SpecificPortionParams {
  @IsEnum(MATCH_ROUND)
    type: MATCH_ROUND
}

export class MatchScoreParams extends GenericMatchParams {
  @IsEnum(MATCH_ALLIANCE)
    color: MATCH_ALLIANCE
}
