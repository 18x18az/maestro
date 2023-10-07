import { Module } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { MatchScorePublisher } from './matchScore.publisher'
import { MatchScoreService } from './matchScore.service'
import { MatchScoreDatabase } from './matchScore.repo'
import { MatchScoreController } from './matchScore.controller'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { PrismaService } from 'src/utils/prisma/prisma.service'

@Module({
  controllers: [MatchScoreController],
  providers: [PublishService, MatchScorePublisher, MatchScoreService, MatchScoreDatabase, PrismaService, InMemoryDBService]
})

export class MatchScoreModule {}
