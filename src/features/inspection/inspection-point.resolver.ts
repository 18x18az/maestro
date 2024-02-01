import { Parent, Resolver, ResolveField } from '@nestjs/graphql'
import { TeamInspectionPoint } from './inspection-point.object'
import { InspectionService, TeamInspectionPointEntity } from './inspection.service'

@Resolver(() => TeamInspectionPoint)
export class InspectionPointResolver {
  constructor (private readonly service: InspectionService) {}

  @ResolveField(() => Boolean)
  async met (@Parent() point: TeamInspectionPointEntity): Promise<boolean> {
    return await this.service.isInspectionPointMet(point.id, point.teamId)
  }
}
