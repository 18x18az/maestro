import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Field } from './field.object'
import { FieldService } from './field.service'
import { FieldEntity } from './field.entity'
import { FieldUpdate } from './field.mutation'
@Resolver(of => Field)
export class FieldResolver {
  constructor (private readonly fieldService: FieldService) {}

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

  @Mutation(() => Field)
  async updateField (
    @Args({ name: 'fieldId', type: () => Int }) fieldId: number,
      @Args({ name: 'update', type: () => FieldUpdate }) update: FieldUpdate
  ): Promise<FieldEntity> {
    return await this.fieldService.updateField(fieldId, update)
  }
}
