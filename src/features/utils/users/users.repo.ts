import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { Role, UserDto } from './users.interface'
import { User } from '@prisma/client'

async function databaseToUser (user: User): Promise<UserDto> {
  return {
    userId: user.userId,
    name: user.name,
    role: user.role as Role,
    hashedToken: user.key
  }
}

@Injectable()
export class UserRepo {
  constructor (private readonly prisma: PrismaService) {}

  async createUser (hashedToken: string): Promise<UserDto> {
    const user = await this.prisma.user.create({
      data: {
        key: hashedToken
      }
    })

    return await databaseToUser(user)
  }

  async findOne (userId: number): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        userId
      }
    })

    if (user === null) {
      return null
    }

    return await databaseToUser(user)
  }

  async findAll (): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany()
    return await Promise.all(users.map(databaseToUser))
  }

  async removeOne (userId: number): Promise<void> {
    await this.prisma.user.delete({
      where: {
        userId
      }
    })
  }
}
