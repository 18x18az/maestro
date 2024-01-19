import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { CompetitionField } from './competition-field.object'
import { CompetitionFieldRepo } from './competition-field.repo'
import { Sitting } from '../match/sitting.object'
import { SittingEntity } from '../match/sitting.entity'
import { CompetitionFieldEntity } from './competition-field.entity'
import { UnqueueSittingEvent } from './unqueue-sitting.event'

@Resolver(of => CompetitionField)
export class CompetitionFieldResolver {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly unqueueEvent: UnqueueSittingEvent
  ) {}

  @ResolveField(() => Sitting, { nullable: true })
  async onFieldSitting (@Parent() field: CompetitionField): Promise<SittingEntity | null> {
    return await this.repo.getOnFieldSitting(field.fieldId)
  }

  @ResolveField(() => Sitting, { nullable: true })
  async onTableSitting (@Parent() field: CompetitionField): Promise<SittingEntity | null> {
    return await this.repo.getOnTableSitting(field.fieldId)
  }

  @Mutation(() => CompetitionField)
  async unqueue (@Args('sittingId') sittingId: number): Promise<CompetitionFieldEntity> {
    const result = await this.unqueueEvent.execute({ sittingId })
    const field = await this.repo.getCompetitionField(result.fieldId)
    if (field === null) throw new Error('Field disappeared')
    return field
  }
}
