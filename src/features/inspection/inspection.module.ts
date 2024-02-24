import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionPointEntity } from './inspection-point.entity'
import { InspectionService } from './inspection.service'
import { InspectionRepo } from './inspection.repo'
import { InspectionGroupResolver, TeamInspectionGroupResolver } from './inspection-group.resolver'
import { InspectionPointResolver } from './inspection-point.resolver'
import { TeamModule } from '../team/team.module'
import { InspectionUpdateEvent } from './inspection-update.event'

@Module({
  imports: [
    TypeOrmModule.forFeature([InspectionGroupEntity, InspectionPointEntity]),
    forwardRef(() => TeamModule)
  ],
  providers: [InspectionService, InspectionRepo, InspectionGroupResolver, InspectionPointResolver, TeamInspectionGroupResolver, InspectionUpdateEvent],
  exports: [InspectionService, InspectionUpdateEvent]
})
export class InspectionModule {}
