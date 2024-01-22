import { Module, forwardRef } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { CompetitionControlService } from './competition.service'
import { CompetitionResolver } from './competition.resolver'
import { OnDeckEvent } from './on-deck.event'
import { FieldModule } from '../../field/field.module'
import { OnLiveEvent } from './on-live.event'
import { OnDeckRemovedEvent } from './on-deck-removed.event'
import { MatchModule } from '../match/match.module'
import { LiveRemovedEvent } from './live-removed.event'
import { CompetitionFieldModule } from '../competition-field/competition-field.module'

@Module({
  imports: [
    forwardRef(() => CompetitionFieldModule),
    forwardRef(() => MatchModule),
    forwardRef(() => FieldModule)
  ],
  providers: [CompetitionControlCache, CompetitionControlService, CompetitionResolver, OnDeckEvent, OnLiveEvent, OnDeckRemovedEvent, LiveRemovedEvent],
  exports: [CompetitionControlService]
})
export class CompetitionModule {}
