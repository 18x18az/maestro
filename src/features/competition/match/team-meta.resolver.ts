import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { TeamMeta } from './team-meta.object'
import { Team } from '../../team/team.object'
import { SavedTeamMeta } from './alliance-score.object'
import { TeamService } from '../../team/team.service'
import { TeamEntity } from '../../team/team.entity'

@Resolver(() => TeamMeta)
export class TeamMetaResolver {
  constructor (private readonly teams: TeamService) {}
  @ResolveField(() => Team)
  async team (@Parent() teamMeta: SavedTeamMeta): Promise<TeamEntity> {
    return await this.teams.getTeam(teamMeta.teamId)
  }
}
