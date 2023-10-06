import { ApiProperty, OmitType } from '@nestjs/swagger'

export class Division {
  @ApiProperty({ description: 'Division ID', example: 1 })
    id: number

  @ApiProperty({ description: 'Name of the division', example: 'Engineering' })
    name: string
}

export class DivisionCreate extends OmitType(Division, ['id'] as const) {}

export class DivisionsCreate {
  @ApiProperty({ description: 'Divisions to create' })
    divisions: DivisionCreate[]
}
