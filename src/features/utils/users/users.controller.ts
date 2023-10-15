import { Controller, Delete, Param } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor (private readonly service: UsersService) {}

  @Delete(':userId')
  async removeUser (@Param(':userId') userId: number): Promise<void> {
    await this.service.removeUser(userId)
  }
}
