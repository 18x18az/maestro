import { Controller, Post, UseGuards, Body } from '@nestjs/common'
import { LocalAuthGuard } from './local-auth.guard'
import { AuthService } from './auth.service'
import { CreatedUser } from '../users/users.interface'
import { UserValidation } from './auth.interface'

@Controller('auth')
export class AuthController {
  constructor (private readonly service: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login (@Body() identity: UserValidation): Promise<void> {
    await this.service.validateUser(identity)
  }

  @Post('register')
  async register (): Promise<CreatedUser> {
    return await this.service.registerUser()
  }
}
