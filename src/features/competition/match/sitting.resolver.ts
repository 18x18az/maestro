import { Query, Resolver } from '@nestjs/graphql'
import { Sitting } from './sitting.object'
import { MatchRepo } from './match.repo'
import { SittingEntity } from './sitting.entity'

@Resolver(of => Sitting)
export class SittingResolver {
  constructor (private readonly repo: MatchRepo) {}
  @Query(() => [Sitting])
  async sittings (): Promise<SittingEntity[]> {
    return await this.repo.getSittings()
  }
}
