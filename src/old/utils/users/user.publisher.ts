import { Injectable } from '@nestjs/common'
import { PublishService } from '../../../old_utils/publish/publish.service'
import { Publisher, Payload } from '@alecmmiller/nestjs-client-generator'
import { User, UserInfo } from './users.interface'

function makeUserTopic (userIdString: string): string {
  return `users/${userIdString}`
}

@Injectable()
export class UserPublisher {
  constructor (private readonly publisher: PublishService) { }

  @Publisher(makeUserTopic(':userId'))
  async publishUser (userId: number, @Payload({}) user: UserInfo): Promise<void> {
    const topic = makeUserTopic(userId.toString())
    await this.publisher.broadcast(topic, user)
  }

  async removeUser (userId: number): Promise<void> {
    const topic = makeUserTopic(userId.toString())
    await this.publisher.broadcast(topic, {})
  }

  @Publisher('users')
  async publishUsers (@Payload({ isArray: true, type: User }) users: User[]): Promise<void> {
    await this.publisher.broadcast('users', users)
  }
}
