import { Args, Field, Int, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Competition } from './competition.object'
import { FieldEntity } from '../../field/field.entity'
import { CompetitionControlService } from './competition.service'
import { OnDeckEvent } from './on-deck.event'
import { OnLiveEvent } from './on-live.event'

@Resolver(() => Competition)
export class CompetitionResolver {
  constructor (
    private readonly service: CompetitionControlService,
    private readonly onDeckEvent: OnDeckEvent,
    private readonly onMatchLive: OnLiveEvent
  ) {}

  @Query(() => Competition)
  async competitionInformation (): Promise<Competition> {
    return {}
  }

  @ResolveField(() => Field, { nullable: true })
  async liveField (): Promise<FieldEntity | null> {
    return await this.service.getLiveField()
  }

  @ResolveField(() => Field, { nullable: true })
  async onDeckField (): Promise<FieldEntity | null> {
    return await this.service.getOnDeckField()
  }

  @Mutation(() => Competition)
  async putOnDeck (@Args({ name: 'fieldId', type: () => Int }) fieldId: number): Promise<Competition> {
    await this.onDeckEvent.execute({ fieldId })
    return {}
  }

  @Mutation(() => Competition)
  async putLive (): Promise<Competition> {
    await this.onMatchLive.execute({})
    return {}
  }
}
