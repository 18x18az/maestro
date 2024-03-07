import { Args, Int, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Overlay } from './overlay.object'
import { AwardStage, OverlayDisplayed } from './overlay.interface'
import { OverlayService } from './overlay.service'
import { Award } from '../../award/award.object'
import { AwardEntity } from '../../award/award.entity'

@Resolver(() => Overlay)
export class OverlayResolver {
  constructor (
    private readonly service: OverlayService
  ) {}

  @Query(() => Overlay)
  overlay (): {} {
    return {}
  }

  @ResolveField(() => OverlayDisplayed)
  async displayed (): Promise<OverlayDisplayed> {
    return await this.service.getDisplayed()
  }

  @Mutation(() => Overlay)
  async setOverlayDisplayed (@Args({ name: 'displayed', type: () => OverlayDisplayed }) displayed: OverlayDisplayed): Promise<{}> {
    await this.service.setDisplayed(displayed)
    return {}
  }

  @ResolveField(() => Award)
  async award (): Promise<AwardEntity | null> {
    return await this.service.getAward()
  }

  @Mutation(() => Overlay)
  async setDisplayedAward (@Args({ name: 'awardId', type: () => Int }) awardId: number): Promise<{}> {
    await this.service.setAward(awardId)
    return {}
  }

  @ResolveField(() => AwardStage)
  stage (): AwardStage {
    return this.service.getAwardStage()
  }

  @Mutation(() => Overlay)
  async advanceAwardStage (): Promise<{}> {
    await this.service.advanceAwardStage()
    return {}
  }
}
