import { ApiProperty } from '@nestjs/swagger'

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

class AllianceScore {
  @ApiProperty({ description: "Number of balls in the alliance's goal", example: 3 })
    goalTriballs: number

  @ApiProperty({ description: "Number of balls in the alliance's offensive zone", example: 3 })
    zoneTriballs: number

  @ApiProperty({ description: "Number of alliance's triballs in either goal", example: 1 })
    allianceTriballsInGoal: number

  @ApiProperty({ description: "Number of alliance's triballs in either offensive zone", example: 1 })
    allianceTriballsInZone: number

  @ApiProperty({ description: 'Elevation level of the first robot on the alliance', example: ELEVATION.B, enum: ELEVATION })
    robot1Tier: ELEVATION

  @ApiProperty({ description: 'Elevation level of the second robot on the alliance', example: ELEVATION.B, enum: ELEVATION })
    robot2Tier: ELEVATION
}

enum AUTON_WINNER {
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
}
