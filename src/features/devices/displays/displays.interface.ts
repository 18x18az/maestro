import { ApiProperty } from '@nestjs/swagger'

export class DisplayConfig {
  @ApiProperty({
    description: "The display's uuid",
    example: '704a4ccd-48b8-4171-a4a7-3a2402cf0546'
  })
    uuid: string

  // @question should I specify it defaults to "unnamed" in description?
  // @question idk what the display name will be
  @ApiProperty({ description: "The display's name", example: 'placeholder' })
    name: string

  @ApiProperty({
    description: "The id of the display's assigned field",
    example: '1'
  })
    fieldId: string | null
}
