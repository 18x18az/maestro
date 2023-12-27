import { Field, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { FieldControl } from './field-control.object'
import { FieldControlService } from './field-control.service'
import { FieldControlStatus } from './field-control.interface'
import { FieldService } from '../field/field.service'
import { FieldEntity } from '../field/field.entity'
import { FieldControlModel } from './field-control.model'

@Resolver(of => FieldControl)
export class FieldControlResolver {
  constructor (
    private readonly fieldControlService: FieldControlService,
    private readonly fieldService: FieldService
  ) {}

  @Query(() => [FieldControl])
  fieldControls (): FieldControlModel[] {
    return this.fieldControlService.getFieldControls()
  }

  @ResolveField()
  async isRunning (@Parent() field: FieldControlStatus): Promise<boolean> {
    return field.endTime !== null
  }

  @ResolveField(() => Field)
  async field (@Parent() field: FieldControlStatus): Promise<FieldEntity> {
    return await this.fieldService.getField(field.fieldId)
  }
}
