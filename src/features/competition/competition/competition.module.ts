import { Module, forwardRef } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { CompetitionControlService } from './competition.service'
import { CompetitionControlPublisher } from './competition.publisher'
import { PublishModule } from '@/utils'
import { CompetitionFieldModule } from '../competition-field'
import { MatchModule } from '../match'

@Module({
  imports: [forwardRef(() => CompetitionFieldModule), PublishModule, forwardRef(() => MatchModule)],
  providers: [CompetitionControlCache, CompetitionControlService, CompetitionControlPublisher],
  exports: [CompetitionControlService]
})
export class CompetitionModule {}
