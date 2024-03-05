import { Query, Resolver } from '@nestjs/graphql'
import { Scene } from './scene.object'
import { SwitcherService } from './switcher.service'

@Resolver(() => Scene)
export class SceneResolver {
  constructor (private readonly service: SwitcherService) {}

  @Query(() => [Scene])
  async scenes (): Promise<Scene[]> {
    return await this.service.findAll()
  }

  @Query(() => Scene)
  async scene (id: number): Promise<Scene> {
    return await this.service.findOne(id)
  }
}
