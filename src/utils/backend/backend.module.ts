import { Module } from '@nestjs/common'
import { StorageModule } from '../storage'
import { BackendService } from './backend.service'
import { BackendResolver } from './backend.resolver'
import { TeamModule } from '../../features/team/team.module'
import { InspectionModule } from '../../features/inspection/inspection.module'
import { StageModule } from '../../features/stage/stage.module'
import { CompetitionFieldModule } from '../../features/competition/competition-field/competition-field.module'
import { FieldModule } from '../../features/field/field.module'
import { MatchModule } from '../../features/competition/match/match.module'

@Module({
  imports: [StorageModule, TeamModule, InspectionModule, StageModule, CompetitionFieldModule, FieldModule, MatchModule],
  providers: [BackendService, BackendResolver]
})
export class BackendModule {}
