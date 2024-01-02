import { Query, Resolver } from '@nestjs/graphql'
import { Match } from './match.object'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'

@Resolver(of => Match)
export class MatchResolver {
  constructor (private readonly repo: MatchRepo) {}

  @Query(returns => [Match])
  async matches (): Promise<MatchEntity[]> {
    return await this.repo.getMatches()
  }
}
