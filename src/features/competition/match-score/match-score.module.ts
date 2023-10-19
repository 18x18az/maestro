import { Module } from '@nestjs/common'
import { PublishService } from 'utils/publish/publish.service'
import { MatchScorePublisher } from './match-score.publisher'
import { MatchScoreService } from './match-score.service'
import { MatchScoreController } from './match-score.controller'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { PrismaService } from 'utils/prisma/prisma.service'
import { SavedScoreDatabase } from './match-saved.repo'
import { WorkingScoreDatabase } from './match-working.repo'

@Module({
  controllers: [MatchScoreController],
  providers: [PublishService, MatchScorePublisher, MatchScoreService, PrismaService, InMemoryDBService, SavedScoreDatabase, WorkingScoreDatabase]
})

export class MatchScoreModule {}
