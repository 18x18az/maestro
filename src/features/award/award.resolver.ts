import { Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Award } from './award.object'
import { AwardService } from './award.service'
import { AwardEntity } from './award.entity'
import { Team } from '../team/team.object'
import { TeamEntity } from '../team/team.entity'

@Resolver(() => Award)
export class AwardResolver {
  constructor (private readonly service: AwardService) {}

  @Query(() => [Award])
  async awards (): Promise<AwardEntity[]> {
    return await this.service.getAwards()
  }

  @ResolveField(() => [Team])
  async winners (award: AwardEntity): Promise<TeamEntity[] | null> {
    return await this.service.getWinners(award)
  }

  @Mutation(() => [Award])
  async updateAwards (): Promise<AwardEntity[]> {
    await this.service.updateAwards()
    return await this.service.getAwards()
  }
}
