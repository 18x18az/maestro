import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Camera, CameraEdit } from './camera.object'
import { CameraService } from './camera.service'
import { CameraEntity } from './camera.entity'
import { Preset } from './preset.object'

@Resolver(() => Camera)
export class CameraResolver {
  constructor (private readonly service: CameraService) {}
  @Query(() => [Camera])
  async cameras (): Promise<CameraEntity[]> {
    return await this.service.findAll()
  }

  @Query(() => Camera)
  async camera (@Args({ type: () => Int, name: 'id' }) id: number): Promise<CameraEntity> {
    return await this.service.findOne(id)
  }

  @ResolveField(() => [Preset])
  async presets (@Parent() camera: CameraEntity): Promise<Preset[]> {
    return await this.service.findPresets(camera.id)
  }

  @ResolveField(() => Preset, { nullable: true })
  async currentPreset (@Parent() camera: CameraEntity): Promise<Preset | undefined> {
    return await this.service.findCurrentPreset(camera.id)
  }

  @Mutation(() => [Camera])
  async addCamera (): Promise<CameraEntity[]> {
    return await this.service.addCamera()
  }

  @Mutation(() => Camera)
  async editCamera (@Args('id', { type: () => Int }) id: number, @Args('data') data: CameraEdit): Promise<CameraEntity> {
    return await this.service.editCamera(id, data)
  }
}
