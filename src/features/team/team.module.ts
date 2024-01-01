import { Module, forwardRef } from '@nestjs/common'
import { TeamResolver } from './team.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamService } from './team.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { StageModule } from '../stage'

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    forwardRef(() => StageModule)
  ],
  providers: [TeamResolver, TeamService, TeamRepo],
  exports: [TeamService]
})
export class TeamModule {}
