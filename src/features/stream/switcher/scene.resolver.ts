import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Scene, SceneEdit } from './scene.object'
import { SwitcherService } from './switcher.service'
import { SceneEntity } from './scene.entity'

@Resolver(() => Scene)
export class SceneResolver {
  constructor (private readonly service: SwitcherService) {}

  @Query(() => [Scene])
  async scenes (): Promise<SceneEntity[]> {
    return await this.service.findAll()
  }

  @Query(() => Scene)
  async scene (id: number): Promise<SceneEntity> {
    return await this.service.findOne(id)
  }

  @Mutation(() => [Scene])
  async addScene (): Promise<SceneEntity[]> {
    await this.service.addScene()
    return await this.service.findAll()
  }

  @Mutation(() => [Scene])
  async removeScene (@Args('id', { type: () => Int }) id: number): Promise<SceneEntity[]> {
    await this.service.removeScene(id)
    return await this.service.findAll()
  }

  @Mutation(() => Scene)
  async editScene (@Args('id', { type: () => Int }) id: number, @Args('data') data: SceneEdit): Promise<SceneEntity> {
    return await this.service.editScene(id, data)
  }
}
