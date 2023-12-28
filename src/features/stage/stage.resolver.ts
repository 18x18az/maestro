import { Query, Resolver } from '@nestjs/graphql'
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
}
