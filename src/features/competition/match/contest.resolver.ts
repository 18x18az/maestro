import { Resolver, Query } from '@nestjs/graphql'
import { Contest } from './contest.object'
import { MatchRepo } from './match.repo'
import { ContestEntity } from './contest.entity'

@Resolver(of => Contest)
export class ContestResolver {
  constructor (private readonly repo: MatchRepo) {}
  @Query(() => [Contest])
  async contests (): Promise<ContestEntity[]> {
    return await this.repo.getContests()
  }
}
