import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql'
import { Contest } from './contest.object'
import { MatchRepo } from './match.repo'
import { ContestEntity } from './contest.entity'
import { Team } from '../../team/team.object'
import { TeamEntity } from '../../team/team.entity'
import { Match } from './match.object'
import { MatchEntity } from './match.entity'

@Resolver(of => Contest)
export class ContestResolver {
  constructor (private readonly repo: MatchRepo) {}
  @Query(() => [Contest])
  async contests (): Promise<ContestEntity[]> {
    return await this.repo.getContests()
  }

  @ResolveField(() => [Team])
  async redTeams (@Parent() contest: ContestEntity): Promise<TeamEntity[]> {
    return await this.repo.getRedTeams(contest.id)
  }

  @ResolveField(() => [Team])
  async blueTeams (@Parent() contest: ContestEntity): Promise<TeamEntity[]> {
    return await this.repo.getBlueTeams(contest.id)
  }

  @ResolveField(() => [Match])
  async matches (@Parent() contest: ContestEntity): Promise<MatchEntity[]> {
    return await this.repo.getMatchesByContest(contest.id)
  }
}
