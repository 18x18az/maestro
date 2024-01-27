import { Module, forwardRef } from '@nestjs/common'
import { TeamResolver } from './team.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamService } from './team.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { TeamListUpdateEvent } from './team-list-update.event'
import { RankingModule } from '../ranking/ranking.module'
import { StageModule } from '../stage/stage.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    forwardRef(() => StageModule),
    forwardRef(() => RankingModule)
  ],
  providers: [TeamResolver, TeamService, TeamRepo, TeamListUpdateEvent],
  exports: [TeamService, TeamListUpdateEvent]
})
export class TeamModule {}
