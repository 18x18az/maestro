import { Module, forwardRef } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { CompetitionControlService } from './competition.service'
import { CompetitionFieldModule } from '../competition-field'
import { MatchModule } from '../match'
import { CompetitionResolver } from './competition.resolver'
import { OnDeckEvent } from './on-deck.event'
import { FieldModule } from '../../field/field.module'

@Module({
  imports: [forwardRef(() => CompetitionFieldModule), forwardRef(() => MatchModule), FieldModule],
  providers: [CompetitionControlCache, CompetitionControlService, CompetitionResolver, OnDeckEvent],
  exports: [CompetitionControlService]
})
export class CompetitionModule {}
