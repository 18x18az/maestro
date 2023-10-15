import { ApiProperty } from '@nestjs/swagger'

export enum Role {
  ADMIN = 'ADMIN',
  CHECKIN = 'CHECKIN',
  REFEREE = 'REFEREE',
  EMCEE = 'EMCEE',
  NONE = 'NONE'
}

export class User {
  @ApiProperty({ example: 1, description: 'ID of the device' })
    userId: number

  @ApiProperty({ example: 'Tablet 1', description: 'Name of the device' })
    name: string

  @ApiProperty({ example: Role.ADMIN, description: 'Role associated with the device', enum: Role })
    role: Role
}

export class UserDto extends User {
  hashedKey: string
}

export class CreatedUser extends User {
  @ApiProperty({ example: 'ABC123', description: 'Token of the device' })
    token: string
}
