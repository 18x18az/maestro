import { ApiProperty } from '@nestjs/swagger'

export enum AGE_GROUP {
  MIDDLE_SCHOOL = 'Middle_School',
  HIGH_SCHOOL = 'High_School',
  COLLEGE = 'College',
}

export class Team {
  @ApiProperty({ description: "The team's number", example: '127C' })
    number: string

  @ApiProperty({ description: "The team's name", example: 'Lemon Bots' })
    name: string

  @ApiProperty({ description: 'The city the team is from', example: 'Gilbert' })
    city: string

  @ApiProperty({ description: 'The state the team is from', example: 'Arizona' })
    state: string

  @ApiProperty({ description: 'The country the team is from', example: 'United States' })
    country: string

  @ApiProperty({ enum: AGE_GROUP, description: 'The age group the team is in', example: AGE_GROUP.HIGH_SCHOOL })
    ageGroup: AGE_GROUP
}

export type TeamInfo = Record<string, Team>
