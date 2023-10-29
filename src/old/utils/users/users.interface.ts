import { ApiProperty } from '@nestjs/swagger'

export enum Role {
  ADMIN = 'ADMIN',
  CHECKIN = 'CHECKIN',
  REFEREE = 'REFEREE',
  EMCEE = 'EMCEE',
  LOCAL = 'LOCAL',
  NONE = 'NONE'
}

export class UserInfo {
  @ApiProperty({ example: 'Tablet 1', description: 'Name of the device' })
    name: string

  @ApiProperty({ example: Role.ADMIN, description: 'Role associated with the device', enum: Role })
    role: Role
}

export class User extends UserInfo {
  @ApiProperty({ example: 1, description: 'ID of the device' })
    userId: number
}

export class UserDto extends User {
  hashedToken: string
}

export class CreatedUser extends User {
  @ApiProperty({ example: 'ABC123', description: 'Token of the device' })
    token: string
}
