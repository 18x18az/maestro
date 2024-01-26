import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Match } from './match.object'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'
import { Sitting } from './sitting.object'
import { SittingEntity } from './sitting.entity'
import { Contest } from './contest.object'
import { ContestEntity } from './contest.entity'

@Resolver(() => Match)
export class MatchResolver {
  constructor (private readonly repo: MatchRepo) {}

  @Query(() => [Match])
  async matches (): Promise<MatchEntity[]> {
    return await this.repo.getMatches()
  }

  @ResolveField(() => [Sitting])
  async sittings (@Parent() match: MatchEntity): Promise<SittingEntity[]> {
    return await this.repo.getSittingsByMatch(match.id)
  }

  @ResolveField(() => Contest)
  async contest (@Parent() match: MatchEntity): Promise<ContestEntity> {
    return await this.repo.getContestByMatch(match.id)
  }
}
