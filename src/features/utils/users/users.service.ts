import { Injectable, Logger } from '@nestjs/common'
import { UserRepo } from './users.repo'
import { User, UserDto } from './users.interface'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor (private readonly repo: UserRepo) {}

  async findOne (id: number): Promise<UserDto | null> {
    return await this.repo.findOne(id)
  }

  async createUser (hashedToken: string): Promise<User> {
    const newUser = await this.repo.createUser(hashedToken)
    this.logger.log(`Created user with name ${newUser.name}`)
    return newUser
  }
}
