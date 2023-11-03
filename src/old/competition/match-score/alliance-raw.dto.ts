import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEnum, IsInt, Max, Min } from 'class-validator'

const TOTAL_TRIBALLS = 60
const ALLIANCE_TRIBALLS = 2
const REGULAR_TRIBALLS = TOTAL_TRIBALLS - (ALLIANCE_TRIBALLS * 2)

export enum ELEVATION {
  NONE = 'none',
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
}

export class AllianceRaw {
  @Max(REGULAR_TRIBALLS)
  @Min(0)
  @IsInt()
  @ApiProperty({
    description: "Number of balls in the alliance's goal",
    example: 3,
    default: 0
  })
    goalTriballs: number

  @Max(REGULAR_TRIBALLS)
  @Min(0)
  @IsInt()
  @ApiProperty({
    description: "Number of balls in the alliance's offensive zone",
    example: 3,
    default: 0
  })
    zoneTriballs: number

  @Min(0)
  @Max(ALLIANCE_TRIBALLS)
  @IsInt()
  @ApiProperty({
    description: "Number of alliance's triballs in either goal",
    example: 1,
    default: 0
  })
    allianceTriballsInGoal: number

  @Min(0)
  @Max(ALLIANCE_TRIBALLS)
  @IsInt()
  @ApiProperty({
    description: "Number of alliance's triballs in either offensive zone",
    example: 1,
    default: 0
  })
    allianceTriballsInZone: number

  @IsEnum(ELEVATION)
  @ApiProperty({
    description: 'Elevation level of the first robot on the alliance',
    example: ELEVATION.B,
    enum: ELEVATION,
    enumName: 'ELEVATION',
    default: 'none'
  })
    robot1Tier: ELEVATION

  @IsEnum(ELEVATION)
  @ApiProperty({
    description: 'Elevation level of the second robot on the alliance',
    example: ELEVATION.B,
    enum: ELEVATION,
    enumName: 'ELEVATION',
    default: 'none'
  })
    robot2Tier: ELEVATION
}

export class AllianceRawUpdate extends PartialType(AllianceRaw) {}
