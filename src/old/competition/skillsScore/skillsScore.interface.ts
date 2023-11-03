import { ApiProperty } from '@nestjs/swagger'

enum ELEVATION {
  NONE = 'none',
  A = 'a',
  B_D = 'b_d',
  E_G = 'e_g',
  H = 'h'
}

export class SkillsScore {
  @ApiProperty({ description: 'Number of balls in the red goal', example: 3 })
    goalTriballs: number

  @ApiProperty({ description: 'Number of balls in the red offensive zone', example: 3 })
    zoneTriballs: number

  @ApiProperty({ description: 'Number of red alliance triballs in either goal', example: 1 })
    allianceTriballsInGoal: number

  @ApiProperty({ description: 'Number of red alliance triballs in either offensive zone', example: 1 })
    allianceTriballsInZone: number

  @ApiProperty({ description: 'Elevation level of the robot', example: ELEVATION.B_D, enum: ELEVATION })
    robot1Tier: ELEVATION
}
