import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Color, Winner } from './match.interface'
import { CalculableScore } from './score.interface'
import { calculateWinner, makeString } from './score.calc'
import { Score, ScoreEdit } from './score.object'
import { Match } from './match.object'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'
import { AllianceScoreEdit } from './alliance-score.object'
import { ScoreService } from './score.service'
import { TeamMetaEdit } from './team-meta.object'

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

  @ResolveField()
  entryString (@Parent() raw: CalculableScore): string {
    return makeString(raw)
  }

  @Mutation(() => Score)
  async editScore (
    @Args({ name: 'matchId', type: () => Int }) matchId: number,
      @Args({ name: 'edit', type: () => ScoreEdit }) edit: ScoreEdit
  ): Promise<CalculableScore> {
    return await this.service.updateScore(matchId, edit)
  }

  @Mutation(() => Score)
  async editAllianceScore (
    @Args({ name: 'matchId', type: () => Int }) matchId: number,
      @Args({ name: 'color', type: () => Color }) color: string,
      @Args({ name: 'edit', type: () => AllianceScoreEdit }) edit: AllianceScoreEdit
  ): Promise<CalculableScore> {
    return await this.service.updateAllianceScore(matchId, color, edit)
  }

  @Mutation(() => Score)
  async editTeamMeta (
    @Args({ name: 'matchId', type: () => Int }) matchId: number,
      @Args({ name: 'teamId', type: () => Int }) teamId: number,
      @Args({ name: 'edit', type: () => TeamMetaEdit }) edit: TeamMetaEdit
  ): Promise<CalculableScore> {
    return await this.service.updateTeamMeta(matchId, teamId, edit)
  }
}
