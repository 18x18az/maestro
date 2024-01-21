import { Args, Field, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Sitting } from './sitting.object'
import { MatchRepo } from './match.repo'
import { SittingEntity } from './sitting.entity'
import { Block } from './block.object'
import { BlockEntity } from './block.entity'
import { Match } from './match.object'
import { MatchEntity } from './match.entity'
import { Contest } from './contest.object'
import { ContestEntity } from './contest.entity'
import { FieldEntity } from '../../field/field.entity'
import { CompetitionFieldService } from '../competition-field/competition-field.service'

@Resolver(of => Sitting)
export class SittingResolver {
  constructor (
    private readonly repo: MatchRepo,
    private readonly competitionField: CompetitionFieldService
  ) {}

  @Query(() => [Sitting])
  async sittings (): Promise<SittingEntity[]> {
    return await this.repo.getSittings()
  }

  @ResolveField(() => Block)
  async block (@Parent() sitting: SittingEntity): Promise<BlockEntity> {
    return await this.repo.getBlock(sitting.blockId)
  }

  @ResolveField(() => Match)
  async match (@Parent() sitting: SittingEntity): Promise<MatchEntity> {
    return await this.repo.getMatch(sitting.matchId)
  }

  @ResolveField(() => Contest)
  async contest (@Parent() sitting: SittingEntity): Promise<ContestEntity> {
    const match = await this.repo.getMatch(sitting.matchId)
    return await this.repo.getContest(match.contestId)
  }

  @ResolveField(() => Field, { nullable: true })
  async field (@Parent() sitting: SittingEntity): Promise<FieldEntity | null> {
    return await this.repo.getField(sitting.id)
  }

  @Mutation(() => Sitting)
  async queueSitting (
    @Args({ name: 'sittingId', type: () => Int }) sittingId: number,
      @Args({ name: 'fieldId', type: () => Int }) fieldId: number
  ): Promise<SittingEntity> {
    await this.competitionField.queueSitting(sittingId, fieldId)
    const sitting = await this.repo.getSitting(sittingId)
    return sitting
  }
}
