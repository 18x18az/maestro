import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Scene, SceneEdit } from './scene.object'
import { SwitcherService } from './switcher.service'
import { SceneEntity } from './scene.entity'
import { Camera } from '../camera/camera.object'
import { CameraEntity } from '../camera/camera.entity'

@Resolver(() => Scene)
export class SceneResolver {
  constructor (private readonly service: SwitcherService) {}

  @Query(() => [Scene])
  async scenes (): Promise<SceneEntity[]> {
    return await this.service.findAll()
  }

  @Query(() => Scene)
  async scene (@Args({ name: 'id', type: () => Int }) id: number): Promise<SceneEntity> {
    return await this.service.findOne(id)
  }

  @Query(() => Scene, { nullable: true })
  async programScene (): Promise<SceneEntity | undefined> {
    return await this.service.programScene()
  }

  @Query(() => Scene, { nullable: true })
  async previewScene (): Promise<SceneEntity | undefined> {
    return await this.service.previewScene()
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

  @ResolveField(() => Camera)
  async camera (@Parent() scene: SceneEntity): Promise<CameraEntity | undefined> {
    return await this.service.findCamera(scene)
  }

  @Mutation(() => Scene)
  async setPreviewScene (@Args('id', { type: () => Int }) id: number): Promise<SceneEntity> {
    await this.service.setPreviewScene(id)
    const scene = await this.service.previewScene()
    if (scene === undefined) throw new Error('Failed to set preview scene')
    return scene
  }

  @Mutation(() => Scene)
  async cutToScene (): Promise<SceneEntity> {
    await this.service.cutToScene()
    const scene = await this.service.programScene()
    if (scene === undefined) throw new Error('Failed to cut to scene')
    return scene
  }

  @Mutation(() => Scene)
  async transitionToScene (): Promise<SceneEntity> {
    await this.service.transitionToScene()
    const scene = await this.service.programScene()
    if (scene === undefined) throw new Error('Failed to transition to scene')
    return scene
  }
}
