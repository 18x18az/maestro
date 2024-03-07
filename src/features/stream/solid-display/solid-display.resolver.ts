import { Args, Int, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { SolidDisplay } from './static.object'
import { SolidDisplayService } from './solid-display.service'
import { Scene } from '../scene.service'
import { SceneEntity } from '../switcher/scene.entity'

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

  @Mutation(() => SolidDisplay)
  async setSolidDisplayScene (@Args({ name: 'sceneId', type: () => Int }) sceneId: number): Promise<{}> {
    await this.service.setSolidDisplay(sceneId)
    return {}
  }
}
