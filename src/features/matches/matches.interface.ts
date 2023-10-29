import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export enum Round {
  QUAL = 'qual',
  Ro16 = 'ro16',
  QF = 'qf',
  SF = 'sf',
  F = 'f'
}

export class MatchIdentifier {
  @IsEnum(Round)
  @ApiProperty({ enum: Round })
    round: Round

  @IsInt()
  @Min(0)
    match: number

  @IsInt()
  @Min(0)
    sitting: number
}

export class ScheduledMatchIdentifier extends MatchIdentifier {
  @IsInt()
  @Min(0)
    replay: number

  @IsDateString()
  @IsOptional()
    time?: string

  @IsString()
    field: string
}

export class Alliance {
  @IsString()
    team1: string

  @IsString()
  @IsOptional()
    team2?: string
}
