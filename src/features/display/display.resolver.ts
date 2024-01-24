import { Args, Field, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Display } from './display.object'
import { DisplayEntity } from './display.entity'
import { DisplayService } from './display.service'
import { FieldService } from '../field/field.service'
import { FieldEntity } from '../field/field.entity'

@Resolver(() => Display)
export class DisplayResolver {
  constructor (
    private readonly service: DisplayService,
    private readonly fields: FieldService
  ) {}

  @Query(() => [Display])
  async displays (): Promise<DisplayEntity[]> {
    return await this.service.getDisplays()
  }

  @Query(() => Display)
  async display (@Args({ name: 'uuid' }) uuid: string): Promise<DisplayEntity> {
    return await this.service.getDisplay(uuid)
  }

  @Mutation(() => Display)
  async renameDisplay (@Args({ name: 'uuid' }) uuid: string, @Args({ name: 'name' }) name: string): Promise<DisplayEntity> {
    return await this.service.renameDisplay(uuid, name)
  }

  @Mutation(() => Display)
  async setDisplayField (@Args({ name: 'uuid' }) uuid: string, @Args({ name: 'fieldId', type: () => Int, nullable: true }) fieldId: number): Promise<DisplayEntity> {
    return await this.service.assignFieldId(uuid, fieldId)
  }

  @ResolveField(() => Field, { nullable: true })
  async field (@Parent() display: DisplayEntity): Promise<FieldEntity | undefined> {
    if (display.fieldId === null) return undefined

    return await this.fields.getField(display.fieldId)
  }
}
