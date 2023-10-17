import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601 } from 'class-validator'

export class Alliance {
  @ApiProperty({ description: 'Team 1 number', example: '127C' })
    team1: string

  @ApiProperty({ description: 'Team 2 number, undefined in VEX U', example: '127C', required: false })
    team2?: string
}

export class QualScheduleMatchUpload {
  @ApiProperty()
    redAlliance: Alliance

  @ApiProperty()
    blueAlliance: Alliance

  @ApiProperty({ description: 'Match number', example: 12 })
    number: number
}

export class QualScheduleBlockUpload {
  @IsISO8601({ strict: true })
  @ApiProperty({ description: 'Start time of the first match in the block in UTC', example: '2021-04-24T09:00:00.000Z' })
    start: string

  @ApiProperty({ description: 'Cycle time in seconds of the block', example: 300 })
    cycleTime: number

  @ApiProperty({ isArray: true, type: QualScheduleMatchUpload })
    matches: QualScheduleMatchUpload[]
}

export class QualScheduleUpload {
  @ApiProperty({ isArray: true, type: QualScheduleBlockUpload })
    blocks: QualScheduleBlockUpload[]
}

export class QualMatch {
  @ApiProperty({ description: 'Match id', example: 1 })
    id: number

  @ApiProperty({ description: 'Match number', example: 1 })
    number: number

  @ApiProperty({ description: 'Red aliance members' })
    red: Alliance

  @ApiProperty({ description: 'Blue aliance members' })
    blue: Alliance
}
