import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Team } from './team.object'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { RankingService } from '../ranking/ranking.service'
import { Checkin } from './team.interface'
import { CheckinService } from './checkin.service'

@Resolver(() => Team)
export class TeamResolver {
  constructor (
    private readonly repo: TeamRepo,
    private readonly rankService: RankingService,
    private readonly checkin: CheckinService
  ) {}

  @Query(() => [Team])
  async teams (): Promise<TeamEntity[]> {
    return await this.repo.getTeams()
  }

  @ResolveField(() => Int)
  async rank (@Parent() team: TeamEntity): Promise<number | null> {
    return this.rankService.getRanking(team.number)
  }

  @Mutation(() => Team)
  async markCheckin (@Args({ name: 'teamId', type: () => Int }) teamId: number, @Args({ name: 'status', type: () => Checkin }) status: Checkin): Promise<TeamEntity> {
    return await this.checkin.markCheckinStatus(teamId, status)
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
