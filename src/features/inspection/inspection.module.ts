import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionPointEntity } from './inspection-point.entity'
import { InspectionService } from './inspection.service'
import { InspectionRepo } from './inspection.repo'
import { InspectionGroupResolver, TeamInspectionGroupResolver } from './inspection-group.resolver'
import { InspectionPointResolver } from './inspection-point.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([InspectionGroupEntity, InspectionPointEntity])],
  providers: [InspectionService, InspectionRepo, InspectionGroupResolver, InspectionPointResolver, TeamInspectionGroupResolver],
  exports: [InspectionService]
})
export class InspectionModule {}
