import { Int, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { AllianceScore, CalculableAllianceScore } from './alliance-score.object'
import { calculateScore } from './score.calc'
import { TeamMeta } from './team-meta.object'

@Resolver(() => AllianceScore)
export class AllianceScoreResolver {
  @ResolveField(() => Int)
  score (@Parent() alliance: CalculableAllianceScore): number {
    return calculateScore(alliance)
  }

  @ResolveField(() => [TeamMeta])
  teams (@Parent() alliance: CalculableAllianceScore): TeamMeta[] {
    return []
  }
}
