import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Display } from './display.object'
import { DisplayEntity } from './display.entity'
import { DisplayService } from './display.service'

@Resolver(() => Display)
export class DisplayResolver {
  constructor (private readonly service: DisplayService) {}

  @Query(() => [Display])
  async displays (): Promise<DisplayEntity[]> {
    return await this.service.getDisplays()
  }

  @Query(() => Display)
  async display (@Args({ name: 'uuid' }) uuid: string): Promise<DisplayEntity> {
    return await this.service.getDisplay(uuid)
  }

  @Mutation(() => Display)
  async renameDisplay (@Args({ name: 'uuid' }) uuid: string, @Args({ name: 'name' }) name: string): Promise<DisplayEntity> {
    return await this.service.renameDisplay(uuid, name)
  }
}
