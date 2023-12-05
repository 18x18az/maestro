import { Module } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { CompetitionControlService } from './competition.service'
import { CompetitionControlPublisher } from './competition.publisher'
import { PublishModule } from '@/utils'
import { CompetitionControlController } from './competition.controller'
import { CompetitionFieldModule } from '../competition-field'

@Module({
  imports: [CompetitionFieldModule, PublishModule],
  controllers: [CompetitionControlController],
  providers: [CompetitionControlCache, CompetitionControlService, CompetitionControlPublisher]
})
export class CompetitionModule {}
