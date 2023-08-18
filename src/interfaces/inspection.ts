import { ApiProperty } from '@nestjs/swagger'

export class InspectionCriteriaSummary {
  @ApiProperty({})
    text: string

  @ApiProperty({})
    met: boolean

  @ApiProperty({})
    uuid: number
}

export interface InspectionChecklist { [group: string]: Array<{ text: string, uuid: number } > }

export class InspectionSectionSummary {
  @ApiProperty({ description: 'The name of the section', example: 'Robot' })
    text: string

  @ApiProperty({ isArray: true, type: InspectionCriteriaSummary })
    criteria: InspectionCriteriaSummary[]
}
export declare type InspectionSummary = InspectionSectionSummary[]
