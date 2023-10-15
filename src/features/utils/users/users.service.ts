import { Injectable, Logger } from '@nestjs/common'
import { UserRepo } from './users.repo'
import { User, UserDto, UserInfo } from './users.interface'
import { UserPublisher } from './user.publisher'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor (private readonly repo: UserRepo, private readonly publisher: UserPublisher) {}

  async onApplicationBootstrap (): Promise<void> {
    const users = await this.repo.findAll()
    const promises = users.map(async user => await this.publishUser(user.userId, user))
    await Promise.all(promises)
  }

  async findOne (id: number): Promise<UserDto | null> {
    return await this.repo.findOne(id)
  }

  async publishUser (userId: number, user: User): Promise<void> {
    const publishableUser: UserInfo = {
      name: user.name,
      role: user.role
    }

    await this.publisher.publishUser(userId, publishableUser)
  }

  async createUser (hashedToken: string): Promise<User> {
    const { hashedToken: _, ...newUser } = await this.repo.createUser(hashedToken)
    this.logger.log(`Created user with name ${newUser.name}`)
    void this.publishUser(newUser.userId, newUser)
    return newUser
  }
}
