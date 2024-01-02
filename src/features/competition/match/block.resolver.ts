import { Query, Resolver } from '@nestjs/graphql'
import { Block } from './block.object'
import { MatchRepo } from './match.repo'
import { BlockEntity } from './block.entity'

@Resolver(of => Block)
export class BlockResolver {
  constructor (private readonly repo: MatchRepo) {}

  @Query(returns => [Block])
  async blocks (): Promise<BlockEntity[]> {
    return await this.repo.getBlocks()
  }
}
