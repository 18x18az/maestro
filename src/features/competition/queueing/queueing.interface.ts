import { QualMatchSitting } from '@/features/initial'
import { ApiProperty } from '@nestjs/swagger'

export class QueuedMatch extends QualMatchSitting {
  @ApiProperty({ description: 'The name of the field the match is on', example: 'Field 1' })
    fieldName: string
}
