import { ApiProperty } from '@nestjs/swagger'

export class InspectionCriteriaSummary {
  @ApiProperty({ description: 'The text of the inspection criteria', example: 'Robot does not exceed 36” in any horizontal dimension while expanded.' })
    text: string

  @ApiProperty({ description: 'Whether the criteria was met or not', example: true })
    met: boolean

  @ApiProperty({ description: 'A unique identifier associated with the critieria', example: 1 })
    uuid: number
}

export interface InspectionChecklist { [group: string]: Array<{ text: string, uuid: number } > }

export class InspectionSectionSummary {
  @ApiProperty({ description: 'The title of the section', example: 'Size Inspection' })
    title: string

  @ApiProperty({ description: 'A list of all inspection criteria in the section', isArray: true, type: InspectionCriteriaSummary })
    criteria: InspectionCriteriaSummary[]
}
export declare type InspectionSummary = InspectionSectionSummary[]
