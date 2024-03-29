import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { CompetitionField } from './competition-field.object'
import { CompetitionFieldRepo } from './competition-field.repo'
import { Sitting } from '../match/sitting.object'
import { SittingEntity } from '../match/sitting.entity'
import { CompetitionFieldEntity } from './competition-field.entity'
import { UnqueueSittingEvent } from './unqueue-sitting.event'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { AutonResetEvent } from './auton-reset.event'
import { CompetitionControlService } from '../competition/competition.service'
import { ReplayMatchEvent } from './replay-match.event'

@Resolver(() => CompetitionField)
export class CompetitionFieldResolver {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly cache: CompetitionFieldControlCache,
    private readonly unqueueEvent: UnqueueSittingEvent,
    private readonly resetEvent: AutonResetEvent,
    private readonly competitionInfo: CompetitionControlService,
    private readonly replayMatch: ReplayMatchEvent
  ) {}

  @ResolveField(() => Sitting, { nullable: true })
  async onFieldSitting (@Parent() field: CompetitionField): Promise<SittingEntity | null> {
    return await this.repo.getOnFieldSitting(field.fieldId)
  }

  @ResolveField(() => Sitting, { nullable: true })
  async onTableSitting (@Parent() field: CompetitionField): Promise<SittingEntity | null> {
    return await this.repo.getOnTableSitting(field.fieldId)
  }

  @ResolveField(() => MATCH_STAGE)
  async stage (@Parent() field: CompetitionField): Promise<MATCH_STAGE> {
    return await this.cache.get(field.fieldId)
  }

  @ResolveField(() => Boolean)
  async isLive (@Parent() field: CompetitionField): Promise<boolean> {
    const liveField = await this.competitionInfo.getLiveField()
    return liveField?.id === field.fieldId
  }

  @ResolveField(() => Boolean)
  async isOnDeck (@Parent() field: CompetitionField): Promise<boolean> {
    const onDeckField = await this.competitionInfo.getOnDeckField()
    return onDeckField?.id === field.fieldId
  }

  @Mutation(() => CompetitionField)
  async unqueue (@Args({ name: 'sittingId', type: () => Int }) sittingId: number): Promise<CompetitionFieldEntity> {
    const result = await this.unqueueEvent.execute({ sittingId })
    const field = await this.repo.getCompetitionField(result.fieldId)
    if (field === null) throw new Error('Field disappeared')
    return field
  }

  @Mutation(() => CompetitionField)
  async resetAuton (@Args({ name: 'fieldId', type: () => Int }) fieldId: number): Promise<CompetitionFieldEntity> {
    const response = await this.resetEvent.execute({ fieldId })
    const field = await this.repo.getCompetitionField(response.fieldId)
    if (field === null) throw new Error('Field disappeared')
    return field
  }

  @Mutation(() => CompetitionField)
  async replay (@Args({ name: 'sittingId', type: () => Int }) sittingId: number): Promise<CompetitionFieldEntity> {
    const response = await this.replayMatch.execute({ sittingId })
    const field = await this.repo.getCompetitionField(response.fieldId)
    if (field === null) throw new Error('Field disappeared')
    return field
  }
}
