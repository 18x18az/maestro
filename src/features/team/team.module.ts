import { Module, forwardRef } from '@nestjs/common'
import { TeamResolver } from './team.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamService } from './team.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { TeamListUpdateEvent } from './team-list-update.event'
import { StageModule } from '../stage/stage.module'
import { TmModule } from '../../utils/tm/tm.module'
import { CheckinService } from './checkin.service'
import { InspectionModule } from '../inspection/inspection.module'
import { CheckinUpdateEvent } from './checkin-update.event'

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    forwardRef(() => StageModule),
    forwardRef(() => TmModule),
    forwardRef(() => InspectionModule)
  ],
  providers: [TeamResolver, TeamService, TeamRepo, TeamListUpdateEvent, CheckinService, CheckinUpdateEvent],
  exports: [TeamService, TeamListUpdateEvent, CheckinUpdateEvent, CheckinService]
})
export class TeamModule {}
