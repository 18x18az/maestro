import { QualMatchSitting } from '@/old/initial'
import { ApiProperty } from '@nestjs/swagger'

export class QueuedMatch extends QualMatchSitting {
  @ApiProperty({ description: 'The name of the field the match is on', example: 'Field 1' })
    fieldName: string

  @ApiProperty({ description: 'The id of the block the match is in', example: 1 })
    blockId: number
}
