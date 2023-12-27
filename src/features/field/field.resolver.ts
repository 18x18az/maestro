import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Field } from './field.object'
import { FieldService } from './field.service'
import { FieldEntity } from './field.entity'
import { FieldUpdate } from './field.mutation'
import { FieldControlModel } from '../field-control/field-control.model'
import { FieldControlService } from '../field-control/field-control.service'
@Resolver(of => Field)
export class FieldResolver {
  constructor (
    private readonly fieldService: FieldService,
    private readonly fieldControlService: FieldControlService
  ) {}

  @Query(returns => [Field])
  async fields (): Promise<FieldEntity[]> {
    const fields = await this.fieldService.getFields()
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

  @Mutation(() => Field)
  async updateField (
    @Args({ name: 'fieldId', type: () => Int }) fieldId: number,
      @Args({ name: 'update', type: () => FieldUpdate }) update: FieldUpdate
  ): Promise<FieldEntity> {
    return await this.fieldService.updateField(fieldId, update)
  }
}
