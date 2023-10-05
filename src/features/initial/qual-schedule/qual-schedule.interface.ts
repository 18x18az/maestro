import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601 } from 'class-validator'

export class AllianceUpload {
  @ApiProperty({ description: 'Team 1 number', example: '127C' })
    team1: string

  @ApiProperty({ description: 'Team 2 number, undefined in VEX U', example: '127C' })
    team2?: string
}

export class QualScheduleMatchUpload {
  @ApiProperty()
    redAlliance: AllianceUpload

  @ApiProperty()
    blueAlliance: AllianceUpload

  @ApiProperty({ description: 'Match number', example: 12 })
    number: number
}

export class QualScheduleBlockUpload {
  @IsISO8601({ strict: true })
  @ApiProperty({ description: 'Start time of the first match in the block in UTC', example: '2021-04-24T09:00:00.000Z' })
    start: string

  @ApiProperty({ isArray: true, type: QualScheduleMatchUpload })
    matches: QualScheduleMatchUpload[]
}

export class QualScheduleUpload {
  @ApiProperty({ isArray: true, type: QualScheduleBlockUpload })
    blocks: QualScheduleBlockUpload[]
}
