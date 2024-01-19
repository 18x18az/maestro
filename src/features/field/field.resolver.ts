import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Field } from './field.object'
import { FieldService } from './field.service'
import { FieldEntity } from './field.entity'
import { FieldUpdate } from './field.mutation'
import { FieldControlModel } from '../field-control/field-control.model'
import { FieldControlService } from '../field-control/field-control.service'
import { FindFieldsArgs } from './dto/find-fields.args'
import { CompetitionFieldService } from '../competition/competition-field/competition-field.service'
import { CompetitionFieldEntity } from '../competition/competition-field/competition-field.entity'
@Resolver(of => Field)
export class FieldResolver {
  constructor (
    private readonly fieldService: FieldService,
    private readonly fieldControlService: FieldControlService,
    private readonly competitionFieldService: CompetitionFieldService
  ) {}

  @Query(returns => [Field])
  async fields (@Args() args: FindFieldsArgs): Promise<FieldEntity[]> {
    const fields = await this.fieldService.getFields(args)
    return fields
  }

  @ResolveField()
  async isCompetition (@Parent() field: FieldEntity): Promise<boolean> {
    return field.isCompetition
  }

  @ResolveField()
  async isSkills (@Parent() field: FieldEntity): Promise<boolean> {
    return !field.isCompetition
  }

  @ResolveField()
  async canRunSkills (@Parent() field: FieldEntity): Promise<boolean> {
    return field.skillsEnabled || !field.isCompetition
  }

  @ResolveField()
  fieldControl (@Parent() field: FieldEntity): FieldControlModel | null {
    if (!field.isEnabled) return null

    return this.fieldControlService.getFieldControl(field.id)
  }

  @ResolveField()
  async competition (@Parent() field: FieldEntity): Promise<CompetitionFieldEntity | null> {
    if (!field.isCompetition) return null
    if (!field.isEnabled) return null
    if (field.skillsEnabled) return null

    return await this.competitionFieldService.getCompetitionField(field.id)
  }

  @Mutation(() => Field)
  async updateField (
    @Args({ name: 'fieldId', type: () => Int }) fieldId: number,
      @Args({ name: 'update', type: () => FieldUpdate }) update: FieldUpdate
  ): Promise<FieldEntity> {
    return await this.fieldService.updateField(fieldId, update)
  }
}
