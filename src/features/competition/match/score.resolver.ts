import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Color, Winner } from './match.interface'
import { CalculableScore } from './score.interface'
import { calculateWinner } from './score.calc'
import { Score } from './score.object'
import { Match } from './match.object'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'
import { AllianceScoreEdit } from './alliance-score.object'
import { ScoreService } from './score.service'

@Resolver(() => Score)
export class ScoreResolver {
  constructor (private readonly matchRepo: MatchRepo, private readonly service: ScoreService) {}
  @ResolveField(() => Winner)
  winner (@Parent() raw: CalculableScore): Winner {
    return calculateWinner(raw)
  }

  @ResolveField(() => Match)
  async match (@Parent() raw: CalculableScore): Promise<MatchEntity> {
    return await this.matchRepo.getMatch(raw.matchId)
  }

  @Mutation(() => Score)
  async editAllianceScore (
    @Args({ name: 'matchId', type: () => Int }) matchId: number,
      @Args({ name: 'color', type: () => Color }) color: string,
      @Args({ name: 'edit', type: () => AllianceScoreEdit }) edit: AllianceScoreEdit
  ): Promise<CalculableScore> {
    return await this.service.updateAllianceScore(matchId, color, edit)
  }
}
