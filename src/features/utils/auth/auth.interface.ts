import { ApiProperty } from '@nestjs/swagger'

export class UserValidation {
  @ApiProperty({ example: 1, description: 'ID of the device' })
    id: number

  @ApiProperty({ example: 'ABC123', description: 'Token of the device' })
    token: string
}
