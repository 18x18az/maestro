import { Module } from '@nestjs/common'
import { TeamResolver } from './team.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamService } from './team.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity])],
  providers: [TeamResolver, TeamService, TeamRepo]
})
export class TeamModule {}
