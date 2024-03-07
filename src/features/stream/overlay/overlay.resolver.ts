import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Overlay } from './overlay.object'
import { OverlayDisplayed } from './overlay.interface'
import { OverlayService } from './overlay.service'

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
}
