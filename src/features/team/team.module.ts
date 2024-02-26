import { Module, forwardRef } from '@nestjs/common'
import { TeamResolver } from './team.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamService } from './team.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { TeamListUpdateEvent } from './team-list-update.event'
import { StageModule } from '../stage/stage.module'
import { CheckinService } from './checkin.service'
import { InspectionModule } from '../inspection/inspection.module'
import { CheckinUpdateEvent } from './checkin-update.event'
import { TeamController } from './team.controller'
import { TeamCreateService } from './team-create.service'

@Module({
  controllers: [TeamController],
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    forwardRef(() => StageModule),
    forwardRef(() => InspectionModule)
  ],
  providers: [TeamResolver, TeamService, TeamRepo, TeamListUpdateEvent, CheckinService, CheckinUpdateEvent, TeamCreateService],
  exports: [TeamService, TeamListUpdateEvent, CheckinUpdateEvent, CheckinService]
})
export class TeamModule {}
