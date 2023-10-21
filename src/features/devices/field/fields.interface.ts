import { ApiProperty } from '@nestjs/swagger'

export class FieldInfo {
  @ApiProperty({ description: 'The name of the field', example: 'Field 1' })
    name: string

  @ApiProperty({ description: 'Whether the field is a competition field', example: true })
    isCompetition: boolean
}

export class FieldInfoBroadcast extends FieldInfo {
  @ApiProperty({ description: 'The field ID', example: 1 })
    fieldId: number
}
