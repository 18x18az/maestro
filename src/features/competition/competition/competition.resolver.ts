import { Args, Field, Int, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Competition } from './competition.object'
import { FieldEntity } from '../../field/field.entity'
import { CompetitionControlService } from './competition.service'
import { OnDeckEvent } from './on-deck.event'
import { OnLiveEvent } from './on-live.event'
import { LiveRemovedEvent } from './live-removed.event'
import { AutomationEnabledEvent } from './automation-enabled.event'
import { AutomationDisabledEvent } from './automation-disabled.event'

@Resolver(() => Competition)
export class CompetitionResolver {
  constructor (
    private readonly service: CompetitionControlService,
    private readonly onDeckEvent: OnDeckEvent,
    private readonly onMatchLive: OnLiveEvent,
    private readonly liveRemovedEvent: LiveRemovedEvent,
    private readonly automationEnabled: AutomationEnabledEvent,
    private readonly automationDisabled: AutomationDisabledEvent
  ) {}

  @Query(() => Competition)
  async competitionInformation (): Promise<Competition> {
    return await this.service.getCompetitionInformation()
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
    return await this.service.getCompetitionInformation()
  }

  @Mutation(() => Competition)
  async clearLive (): Promise<Competition> {
    await this.liveRemovedEvent.execute({})
    return await this.service.getCompetitionInformation()
  }

  @Mutation(() => Competition)
  async putLive (): Promise<Competition> {
    await this.onMatchLive.execute({})
    return await this.service.getCompetitionInformation()
  }

  @Mutation(() => Competition)
  async setAutomationEnabled (@Args({ name: 'enabled', type: () => Boolean }) enabled: boolean): Promise<Competition> {
    if (enabled) {
      await this.automationEnabled.execute()
    } else {
      await this.automationDisabled.execute()
    }
    return await this.service.getCompetitionInformation()
  }

  @Mutation(() => Competition)
  async setAutoAdvance (@Args({ name: 'enabled', type: () => Boolean }) enabled: boolean): Promise<Competition> {
    await this.service.setAutoAdvance(enabled)
    return await this.service.getCompetitionInformation()
  }
}
