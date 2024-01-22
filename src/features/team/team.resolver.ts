import { Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Team } from './team.object'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { RankingService } from '../ranking/ranking.service'

@Resolver(() => Team)
export class TeamResolver {
  constructor (
    private readonly repo: TeamRepo,
    private readonly rankService: RankingService
  ) {}

  @Query(() => [Team])
  async teams (): Promise<TeamEntity[]> {
    return await this.repo.getTeams()
  }

  @ResolveField(() => Int)
  async rank (@Parent() team: TeamEntity): Promise<number | null> {
    return this.rankService.getRanking(team.number)
  }

  // TODO team update
  // @Mutation(() => Team)
  // async updateTeam (
  //   @Args({ name: 'teamId', type: () => Int }) teamId: number,
  //     @Args({ name: 'update', type: () => TeamUpdate }) update: TeamUpdate
  // ): Promise<Team> {
  //   return await this.teamService.updateTeam(teamId, update)
  // }

  // TODO this will eventually be used with honeybadger
  // @Mutation(() => [Team])
  // async createTeams (@Args({ name: 'teams', type: () => [TeamCreate] }) teams: TeamCreate[]): Promise<Team[]> {
  //   return await this.teamService.createTeams(teams)
  // }
}
