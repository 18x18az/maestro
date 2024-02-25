import { Int, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { AllianceScore, CalculableAllianceScore } from './alliance-score.object'

@Resolver(() => AllianceScore)
export class AllianceScoreResolver {
  @ResolveField(() => Int)
  score (@Parent() alliance: CalculableAllianceScore): number {
    console.log(alliance)
    return 0
  }
}
