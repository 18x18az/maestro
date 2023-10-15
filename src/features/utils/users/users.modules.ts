import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserRepo } from './users.repo'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { UserPublisher } from './user.publisher'
import { PublishService } from '../../../utils/publish/publish.service'

@Module({
  providers: [UsersService, UserRepo, PrismaService, UserPublisher, PublishService],
  exports: [UsersService]
})
export class UsersModule {}
