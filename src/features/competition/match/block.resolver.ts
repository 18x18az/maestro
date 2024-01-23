import { Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Block } from './block.object'
import { MatchRepo } from './match.repo'
import { BlockEntity } from './block.entity'
import { MatchInternal } from './match.internal'
import { Sitting } from './sitting.object'
import { SittingEntity } from './sitting.entity'

@Resolver(() => Block)
export class BlockResolver {
  constructor (private readonly repo: MatchRepo, private readonly service: MatchInternal) {}

  @Query(() => [Block])
  async blocks (): Promise<BlockEntity[]> {
    return await this.repo.getBlocks()
  }

  @Query(() => Block, { nullable: true })
  async currentBlock (): Promise<BlockEntity | null> {
    return await this.repo.getCurrentBlock()
  }

  @Query(() => Block, { nullable: true })
  async nextBlock (): Promise<BlockEntity | null> {
    return await this.repo.getNextBlock()
  }

  @ResolveField(() => [Sitting])
  async sittings (@Parent() block: BlockEntity): Promise<SittingEntity[]> {
    return await this.repo.getSittingsByBlock(block.id)
  }

  @ResolveField(() => [Sitting])
  async unqueuedSittings (@Parent() block: BlockEntity): Promise<SittingEntity[]> {
    return await this.repo.getUnqueuedSittingsByBlock(block.id)
  }

  @ResolveField(() => Date, { nullable: true })
  async startTime (@Parent() block: BlockEntity): Promise<Date | null> {
    return await this.repo.getBlockStartTime(block.id)
  }

  @ResolveField(() => Date, { nullable: true })
  async endTime (@Parent() block: BlockEntity): Promise<Date | null> {
    return await this.repo.getBlockEndTime(block.id)
  }

  @ResolveField(() => Boolean)
  async canConclude (@Parent() block: BlockEntity): Promise<boolean> {
    return await this.repo.canConcludeBlock(block.id)
  }

  @Mutation(() => Block)
  async startNextBlock (): Promise<BlockEntity | null> {
    await this.service.startNextBlock()
    return await this.repo.getCurrentBlock()
  }

  @Mutation(() => Block)
  async concludeBlock (): Promise<BlockEntity | null> {
    return await this.service.concludeBlock()
  }
}
