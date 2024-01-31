import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { InspectionGroup } from './inspection-group.object'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionService } from './inspection.service'
import { InspectionPoint } from './inspection-point.object'
import { InspectionPointEntity } from './inspection-point.entity'

@Resolver(() => InspectionGroup)
export class InspectionResolver {
  constructor (private readonly service: InspectionService) {}

  @Query(() => [InspectionGroup])
  async inspectionGroups (): Promise<InspectionGroupEntity[]> {
    return await this.service.getInspectionGroups()
  }

  @ResolveField(() => [InspectionPoint])
  async points (@Parent() group: InspectionGroupEntity): Promise<InspectionPointEntity[]> {
    return await this.service.getInspectionPoints(group.id)
  }
}
