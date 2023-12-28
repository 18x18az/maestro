import { Mutation, Query, Resolver } from '@nestjs/graphql'
import { Stage } from './stage.object'
import { StageService } from './stage.service'

@Resolver(of => Stage)
export class StageResolver {
  constructor (private readonly service: StageService) {}
  @Query(() => Stage)
  async stage (): Promise<Stage> {
    return {
      stage: await this.service.getStage()
    }
  }

  @Mutation(() => Stage, { description: 'Reset the event. Only available in test mode.' })
  async reset (): Promise<Stage> {
    await this.service.reset()
    return {
      stage: await this.service.getStage()
    }
  }
}
