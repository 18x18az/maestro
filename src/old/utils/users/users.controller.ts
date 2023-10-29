import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { Role } from './users.interface'

interface RoleBody {
  role: Role
}

interface NameBody {
  name: string
}

@Controller('users')
export class UsersController {
  constructor (private readonly service: UsersService) {}

  @Delete(':userId')
  async removeUser (@Param('userId') userId: string): Promise<void> {
    await this.service.removeUser(parseInt(userId))
  }

  @Post(':userId/role')
  async setRole (@Param('userId') userId: string, @Body() role: RoleBody): Promise<void> {
    await this.service.setUserRole(parseInt(userId), role.role)
  }

  @Post(':userId/name')
  async setName (@Param('userId') userId: string, @Body() name: NameBody): Promise<void> {
    await this.service.setUserName(parseInt(userId), name.name)
  }
}
