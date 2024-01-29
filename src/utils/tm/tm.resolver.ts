import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { TournamentManager, TournamentManagerSetup } from './tm.object'
import { TmInternal } from './tm.internal'

@Resolver(of => TournamentManager)
export class TmResolver {
  constructor (private readonly service: TmInternal) {}

  @Query(() => TournamentManager)
  async tournamentManager (): Promise<TournamentManager> {
    return {
      status: this.service.getStatus(),
      url: this.service.getUrl()
    }
  }

  @Mutation(() => TournamentManager)
  async configureTournamentManager (
    @Args({ name: 'settings', type: () => TournamentManagerSetup }) settings: TournamentManagerSetup
  ): Promise<TournamentManager> {
    const status = await this.service.setConfig(settings.url, settings.password)
    return {
      status,
      url: this.service.getUrl()
    }
  }
}
