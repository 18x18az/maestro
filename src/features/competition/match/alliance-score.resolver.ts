import { Int, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { AllianceScore, CalculableAllianceScore } from './alliance-score.object'
import { calculateScore } from './score.calc'

@Resolver(() => AllianceScore)
export class AllianceScoreResolver {
  @ResolveField(() => Int)
  score (@Parent() alliance: CalculableAllianceScore): number {
    return calculateScore(alliance)
  }
}
