import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { InspectionGroup, TeamInspectionGroup } from './inspection-group.object'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionService, TeamInspectionGroupEntity, TeamInspectionPointEntity } from './inspection.service'
import { InspectionPoint } from './inspection-point.object'
import { InspectionPointEntity } from './inspection-point.entity'

@Resolver(() => InspectionGroup)
class BaseInspectionGroupResolver {
  constructor (protected readonly service: InspectionService) {}

  @Query(() => [InspectionGroup])
  async inspectionGroups (): Promise<InspectionGroupEntity[]> {
    return await this.service.getInspectionGroups()
  }

  @ResolveField(() => [InspectionPoint])
  async points (@Parent() group: InspectionGroupEntity): Promise<InspectionPointEntity[]> {
    return await this.service.getInspectionPoints(group.id)
  }
}

@Resolver(() => InspectionGroup)
export class InspectionGroupResolver extends BaseInspectionGroupResolver {
  @ResolveField(() => [InspectionPoint])
  async points (@Parent() group: InspectionGroupEntity): Promise<InspectionPointEntity[]> {
    return await this.service.getInspectionPoints(group.id)
  }
}

@Resolver(() => TeamInspectionGroup)
export class TeamInspectionGroupResolver extends BaseInspectionGroupResolver {
  @ResolveField(() => [InspectionPoint])
  async points (@Parent() group: TeamInspectionGroupEntity): Promise<TeamInspectionPointEntity[]> {
    return await this.service.getTeamInspectionPoints(group.id, group.teamId)
  }

  @ResolveField(() => [InspectionPoint])
  async unmetPoints (@Parent() group: TeamInspectionGroupEntity): Promise<TeamInspectionPointEntity[]> {
    return await this.service.getUnmetTeamInspectionPoints(group.id, group.teamId)
  }
}
