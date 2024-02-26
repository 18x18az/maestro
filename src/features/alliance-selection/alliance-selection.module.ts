import { Module } from '@nestjs/common'
import { AllianceSelectionInternal } from './alliance-selection.internal'
import { StageModule } from '../stage/stage.module'
import { RankingModule } from '../ranking/ranking.module'
import { AllianceSelectionResolver } from './alliance-selection.resolver'
import { TeamModule } from '../team/team.module'

@Module({
  imports: [RankingModule, StageModule, TeamModule],
  providers: [AllianceSelectionInternal, AllianceSelectionModule, AllianceSelectionResolver]
})
export class AllianceSelectionModule {}
