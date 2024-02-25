import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Winner } from './match.interface'
import { CalculableScore } from './score.interface'
import { calculateWinner } from './score.calc'
import { Score } from './score.object'

@Resolver(() => Score)
export class ScoreResolver {
  @ResolveField(() => Winner)
  winner (@Parent() raw: CalculableScore): Winner {
    return calculateWinner(raw)
  }
}
