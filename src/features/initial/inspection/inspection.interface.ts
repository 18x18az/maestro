import { ApiProperty } from '@nestjs/swagger'

export enum INSPECTION_STAGE {
  NO_SHOW = 'NO_SHOW',
  NOT_HERE = 'NOT_HERE',
  CHECKED_IN = 'CHECKED_IN',
  PARTIAL = 'PARTIAL',
  COMPLETE = 'COMPLETE',
}

export class RequirementDataBroadcast {
  @ApiProperty({ description: 'The requirement UUID', example: 1 })
    uuid: number

  @ApiProperty({ description: 'The requirement text', example: 'Robot does NOT contain any components which will intentionally detach' })
    description: string

  @ApiProperty({ description: 'Whether the requirement is met', example: true })
    isMet: boolean
}

export class InspectionSectionDataBroadcast {
  @ApiProperty({ description: 'The section title', example: 'Robot rules' })
    title: string

  @ApiProperty({ description: 'The section requirements', isArray: true, type: RequirementDataBroadcast })
    childRequirements: RequirementDataBroadcast[]
}
