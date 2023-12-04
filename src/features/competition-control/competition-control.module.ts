import { Module } from '@nestjs/common'
import { CompetitionControlCache } from './competition-control.cache'
import { CompetitionControlService } from './competition-control.service'
import { CompetitionControlPublisher } from './competition-control.publisher'
import { CompetitionFieldModule } from '../competition-field/competition-field.module'
import { PublishModule } from '../../utils'
import { CompetitionControlController } from './competition-control.controller'

@Module({
  imports: [CompetitionFieldModule, PublishModule],
  controllers: [CompetitionControlController],
  providers: [CompetitionControlCache, CompetitionControlService, CompetitionControlPublisher]
})
export class CompetitionControlModule {}
