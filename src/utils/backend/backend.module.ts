import { Module } from '@nestjs/common'
import { StorageModule } from '../storage'
import { BackendService } from './backend.service'
import { BackendResolver } from './backend.resolver'
import { TeamModule } from '../../features/team/team.module'
import { InspectionModule } from '../../features/inspection/inspection.module'
import { StageModule } from '../../features/stage/stage.module'

@Module({
  imports: [StorageModule, TeamModule, InspectionModule, StageModule],
  providers: [BackendService, BackendResolver]
})
export class BackendModule {}
