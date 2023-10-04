import { ApiProperty } from '@nestjs/swagger'
import { RecursivePartial } from 'src/utils/recursivePartial'

enum ELEVATION {
  NONE = 'none',
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h'
}

export class AllianceScore {
  @ApiProperty({ description: "Number of balls in the alliance's goal", example: 3 })
    goalTriballs: number

  @ApiProperty({ description: "Number of balls in the alliance's offensive zone", example: 3 })
    zoneTriballs: number

  @ApiProperty({ description: "Number of alliance's triballs in either goal", example: 1 })
    allianceTriballsInGoal: number

  @ApiProperty({ description: "Number of alliance's triballs in either offensive zone", example: 1 })
    allianceTriballsInZone: number

  @ApiProperty({ description: 'Elevation level of the first robot on the alliance', example: ELEVATION.B, enum: ELEVATION, enumName: 'ELEVATION' })
    robot1Tier: ELEVATION

  @ApiProperty({ description: 'Elevation level of the second robot on the alliance', example: ELEVATION.B, enum: ELEVATION, enumName: 'ELEVATION' })
    robot2Tier: ELEVATION
}

export enum AUTON_WINNER {
  RED = 'red',
  BLUE = 'blue',
  TIE = 'tie',
  NONE = 'none'
}

export class MatchScore {
  @ApiProperty({ description: 'Red team raw score' })
    redScore: AllianceScore

  @ApiProperty({ description: 'Blue team raw score' })
    blueScore: AllianceScore

  @ApiProperty({ description: 'Auton winner', example: AUTON_WINNER.RED, enum: AUTON_WINNER })
    autonWinner: AUTON_WINNER

  @ApiProperty({ description: 'Prevents modification when locked and prevents saving to DB when unlocked', example: false })
    locked: boolean
}

export type MatchScoreUpdate = RecursivePartial<Omit<MatchScore, 'locked'>>

export type MatchScoreInMemory = { id: string } & RecursivePartial<
Omit<MatchScore, 'locked'>
> &
Pick<MatchScore, 'locked'>
export type MatchScoreInPrisma = { scoreId: number, matchId: number } & {
  [K in keyof Omit<MatchScore, 'locked'>]: MatchScore[K] extends string
    ? MatchScore[K]
    : string;
}
