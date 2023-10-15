import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserRepo } from './users.repo'
import { PrismaService } from '../../../utils/prisma/prisma.service'

@Module({
  providers: [UsersService, UserRepo, PrismaService],
  exports: [UsersService]
})
export class UsersModule {}
