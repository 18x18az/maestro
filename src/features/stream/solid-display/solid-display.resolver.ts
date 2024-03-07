import { Args, Int, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { SolidDisplay } from './static.object'
import { SolidDisplayService } from './solid-display.service'
import { SceneEntity } from '../switcher/scene.entity'
import { SolidDisplayDisplayed } from './solid-display.interface'
import { Scene } from '../switcher/scene.object'

@Resolver(() => SolidDisplay)
export class SolidDisplayResolver {
  constructor (
    private readonly service: SolidDisplayService
  ) {}

  @Query(() => SolidDisplay)
  async solidDisplay (): Promise<{}> {
    return {}
  }

  @ResolveField(() => Scene, { nullable: true })
  async scene (): Promise<SceneEntity | undefined> {
    return await this.service.getSolidDisplayScene()
  }

  @ResolveField(() => SolidDisplayDisplayed)
  async displayed (): Promise<SolidDisplayDisplayed> {
    return await this.service.getDisplayed()
  }

  @Mutation(() => SolidDisplay)
  async setSolidDisplayScene (@Args({ name: 'sceneId', type: () => Int }) sceneId: number): Promise<{}> {
    await this.service.setSolidDisplay(sceneId)
    return {}
  }

  @Mutation(() => SolidDisplay)
  async setSolidDisplayed (@Args({ name: 'displayed', type: () => SolidDisplayDisplayed }) displayed: SolidDisplayDisplayed): Promise<{}> {
    await this.service.setDisplayed(displayed)
    return {}
  }
}
