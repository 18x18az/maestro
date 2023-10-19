import { Module } from '@nestjs/common'
import { PublishService } from 'utils/publish/publish.service'
import { MatchScorePublisher } from './match-score.publisher'
import { MatchScoreService } from './match-score.service'
import { MatchScoreDatabase } from './match-score.repo'
import { MatchScoreController } from './match-score.controller'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { PrismaService } from 'utils/prisma/prisma.service'
import { SavedScoreDatabase } from './match-saved.repo'

@Module({
  controllers: [MatchScoreController],
  providers: [PublishService, MatchScorePublisher, MatchScoreService, MatchScoreDatabase, PrismaService, InMemoryDBService, SavedScoreDatabase]
})

export class MatchScoreModule {}
