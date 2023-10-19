import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, ValidateNested } from 'class-validator'
import { AllianceRaw } from './alliance-raw.dto'
import { ApiProperty } from '@nestjs/swagger'

export enum AUTON_WINNER {
  RED = 'red',
  BLUE = 'blue',
  TIE = 'tie',
  NONE = 'none',
}

export enum OUTCOME_METADATA {
  NONE = 'none',
  NO_SHOW = 'no_show',
  DISQUALIFIED = 'disqualified',
}

export class MatchMetadataUpload {
  @IsEnum(OUTCOME_METADATA)
  @ApiProperty({
    description: 'Whether the team no-show-ed or was dq-ed from the match',
    example: OUTCOME_METADATA.NONE,
    enum: OUTCOME_METADATA,
    default: OUTCOME_METADATA.NONE
  })
    outcome: OUTCOME_METADATA
}

export class CommonMatchScore {
  @ApiProperty({ description: 'Match number', example: 1 })
    matchNumber: number

  @ApiProperty({})
    id: string

  @ValidateNested()
  @Type(() => AllianceRaw)
  @ApiProperty({ description: 'Red team raw score', type: AllianceRaw })
    redRaw: AllianceRaw

  @ValidateNested()
  @Type(() => AllianceRaw)
  @ApiProperty({ description: 'Blue team raw score', type: AllianceRaw })
    blueRaw: AllianceRaw

  @IsEnum(AUTON_WINNER)
  @ApiProperty({
    description: 'Auton winner',
    example: AUTON_WINNER.RED,
    enum: AUTON_WINNER,
    default: 'none'
  })
    autonWinner: AUTON_WINNER

  @IsBoolean()
  @ApiProperty({
    description:
        'Prevents modification when locked and prevents saving to DB when unlocked',
    example: false,
    default: false
  })
    locked: boolean

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the match has been saved to the database',
    example: false,
    default: false
  })
    saved: boolean
}
