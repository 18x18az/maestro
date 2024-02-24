import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Backend, BackendSetup } from './backend.object'
import { BackendService } from './backend.service'

@Resolver(() => Backend)
export class BackendResolver {
  constructor (private readonly service: BackendService) {}

  @Query(() => Backend)
  async backend (): Promise<Backend> {
    return {
      status: this.service.getStatus(),
      url: this.service.getUrl()
    }
  }

  @Mutation(() => Backend)
  async configureBackend (
    @Args({ name: 'settings', type: () => BackendSetup }) settings: BackendSetup
  ): Promise<Backend> {
    const status = await this.service.setConfig(settings.url, settings.password)
    return {
      status,
      url: this.service.getUrl()
    }
  }
}
