import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserRepo } from './users.repo'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { UserPublisher } from './user.publisher'
import { PublishService } from '../../../utils/publish/publish.service'
import { UsersController } from './users.controller'

@Module({
  providers: [UsersService, UserRepo, PrismaService, UserPublisher, PublishService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
