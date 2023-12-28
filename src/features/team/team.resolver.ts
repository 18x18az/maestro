import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Team, TeamCreate, TeamUpdate } from './team.object'
import { TeamService } from './team.service'
import { TeamRepo } from './team.repo'

@Resolver(of => Team)
export class TeamResolver {
  constructor (private readonly teamService: TeamService, private readonly repo: TeamRepo) {}

  @Query(() => [Team])
  async teams (): Promise<Team[]> {
    return await this.repo.getTeams()
  }

  @Mutation(() => Team)
  async updateTeam (
    @Args({ name: 'teamId', type: () => Int }) teamId: number,
      @Args({ name: 'update', type: () => TeamUpdate }) update: TeamUpdate
  ): Promise<Team> {
    return await this.teamService.updateTeam(teamId, update)
  }

  @Mutation(() => [Team])
  async createTeams (@Args({ name: 'teams', type: () => [TeamCreate] }) teams: TeamCreate[]): Promise<Team[]> {
    return await this.teamService.createTeams(teams)
  }
}