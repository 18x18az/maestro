import { Module } from '@nestjs/common'
import { AllianceSelectionInternal } from './alliance-selection.internal'
import { StageModule } from '../stage/stage.module'
import { RankingModule } from '../ranking/ranking.module'
import { AllianceSelectionResolver } from './alliance-selection.resolver'
import { TeamModule } from '../team/team.module'
import { MatchModule } from '../competition/match/match.module'

@Module({
  imports: [RankingModule, StageModule, TeamModule, MatchModule],
  providers: [AllianceSelectionInternal, AllianceSelectionModule, AllianceSelectionResolver]
})
export class AllianceSelectionModule {}
