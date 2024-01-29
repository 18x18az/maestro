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
import { SkillsService } from '../skills/skills.service'
import { Skills } from '../skills/skills.object'
@Resolver(() => Field)
export class FieldResolver {
  constructor (
    private readonly fieldService: FieldService,
    private readonly fieldControlService: FieldControlService,
    private readonly competitionFieldService: CompetitionFieldService,
    private readonly skillsService: SkillsService
  ) {}

  @Query(() => [Field])
  async fields (@Args() args: FindFieldsArgs): Promise<FieldEntity[]> {
    const fields = await this.fieldService.getFields(args)
    return fields
  }

  @Query(() => Field)
  async field (@Args({ name: 'fieldId', type: () => Int }) fieldId: number): Promise<FieldEntity> {
    return await this.fieldService.getField(fieldId)
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

  @Mutation(() => Field)
  async addField (): Promise<FieldEntity> {
    return await this.fieldService.addField()
  }

  @Mutation(() => [Field])
  async deleteField (
    @Args({ name: 'fieldId', type: () => Int }) fieldId: number
  ): Promise<FieldEntity[]> {
    await this.fieldService.deleteField(fieldId)
    return await this.fieldService.getAllFields()
  }

  @Mutation(() => [Field])
  async setSkillsEnabled (
    @Args({ name: 'enabled', type: () => Boolean }) enabled: boolean
  ): Promise<FieldEntity[]> {
    await this.fieldService.setSkillsEnabled(enabled)
    return await this.fieldService.getAllFields()
  }

  @ResolveField(() => Skills)
  async skills (@Parent() field: FieldEntity): Promise<Skills | undefined> {
    return await this.skillsService.getSkillsMatch(field.id)
  }
}
