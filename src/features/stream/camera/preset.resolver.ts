import { Args, Int, Mutation, Resolver } from '@nestjs/graphql'
import { Preset, PresetUpdate } from './preset.object'
import { PresetEntity } from './preset.entity'
import { CameraService } from './camera.service'

@Resolver(() => Preset)
export class PresetResolver {
  constructor (private readonly service: CameraService) {}
  @Mutation(() => Preset)
  async updatePreset (@Args({ type: () => Int, name: 'id' }) id: number, @Args({ type: () => PresetUpdate, name: 'update' }) update: PresetUpdate): Promise<PresetEntity> {
    return await this.service.updatePreset(id, update)
  }
}
