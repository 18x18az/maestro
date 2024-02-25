import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Winner } from './match.interface'
import { CalculableScore } from './score.interface'
import { calculateWinner } from './score.calc'
import { Score } from './score.object'
import { Match } from './match.object'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'

@Resolver(() => Score)
export class ScoreResolver {
  constructor (private readonly matchRepo: MatchRepo) {}
  @ResolveField(() => Winner)
  winner (@Parent() raw: CalculableScore): Winner {
    return calculateWinner(raw)
  }

  @ResolveField(() => Match)
  async match (@Parent() raw: CalculableScore): Promise<MatchEntity> {
    return await this.matchRepo.getMatch(raw.matchId)
  }
}
