import { Field, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { FieldControl } from './field-control.object'
import { FieldControlStatus } from './field-control.interface'
import { FieldService } from '../field/field.service'
import { FieldEntity } from '../field/field.entity'

@Resolver(of => FieldControl)
export class FieldControlResolver {
  constructor (
    private readonly fieldService: FieldService
  ) {}

  @ResolveField()
  async isRunning (@Parent() field: FieldControlStatus): Promise<boolean> {
    return field.endTime !== null
  }

  @ResolveField(() => Field)
  async field (@Parent() field: FieldControlStatus): Promise<FieldEntity> {
    return await this.fieldService.getField(field.fieldId)
  }
}
