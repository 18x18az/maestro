import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Match } from './match.object'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'
import { Sitting } from './sitting.object'
import { SittingEntity } from './sitting.entity'
import { Contest } from './contest.object'
import { ContestEntity } from './contest.entity'
import { Score } from './score.object'
import { ScoreService } from './score.service'
import { CalculableScore } from './score.interface'
import { Winner } from './match.interface'

@Resolver(() => Match)
export class MatchResolver {
  constructor (
    private readonly repo: MatchRepo,
    private readonly scores: ScoreService
  ) {}

  @Query(() => [Match])
  async matches (): Promise<MatchEntity[]> {
    return await this.repo.getMatches()
  }

  @ResolveField(() => [Sitting])
  async sittings (@Parent() match: MatchEntity): Promise<SittingEntity[]> {
    return await this.repo.getSittingsByMatch(match.id)
  }

  @ResolveField(() => Contest)
  async contest (@Parent() match: MatchEntity): Promise<ContestEntity> {
    return await this.repo.getContestByMatch(match.id)
  }

  @ResolveField(() => Score)
  async workingScore (@Parent() match: MatchEntity): Promise<CalculableScore> {
    return await this.scores.getCalculableScore(match.id)
  }

  @ResolveField(() => Score)
  async savedScore (@Parent() match: MatchEntity): Promise<CalculableScore | null> {
    return await this.scores.getSavedScore(match.id)
  }

  @ResolveField(() => [Score])
  async scoreHistory (@Parent() match: MatchEntity): Promise<CalculableScore[]> {
    return await this.scores.getSavedScores(match.id)
  }

  @ResolveField(() => Winner)
  async winner (@Parent() match: MatchEntity): Promise<Winner> {
    return await this.scores.getWinner(match.id)
  }

  @Mutation(() => Match)
  async saveScore (@Args({ name: 'matchId', type: () => Int }) matchId: number): Promise<MatchEntity> {
    await this.scores.saveScore(matchId)
    return await this.repo.getMatch(matchId)
  }

  @Query(() => Match)
  async match (@Args({ name: 'id', type: () => Int }) id: number): Promise<MatchEntity> {
    return await this.repo.getMatch(id)
  }
}
