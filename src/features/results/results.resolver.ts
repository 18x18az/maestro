import { Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Results } from './results.object'
import { MatchEntity } from '../competition/match/match.entity'
import { Match } from '../competition/match/match.object'
import { ResultsInternal } from './results.internal'
import { MatchService } from '../competition/match/match.service'

@Resolver(() => Results)
export class ResultsResolver {
  constructor (
    private readonly service: ResultsInternal,
    private readonly match: MatchService
  ) {}

  @Query(() => Results)
  results (): {} {
    return {}
  }

  @ResolveField(() => Match, { nullable: true })
  async displayedResults (): Promise<MatchEntity | undefined> {
    const matchId = this.service.getDisplayedMatchId()

    if (matchId === null) return undefined

    return await this.match.getMatch(matchId) ?? undefined
  }

  @ResolveField(() => Match, { nullable: true })
  async nextResults (): Promise<MatchEntity | undefined> {
    const matchId = this.service.getNextMatchId()

    if (matchId === null) return undefined

    return await this.match.getMatch(matchId) ?? undefined
  }
}
