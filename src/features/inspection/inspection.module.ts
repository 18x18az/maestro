import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionPointEntity } from './inspection-point.entity'
import { InspectionService } from './inspection.service'
import { InspectionRepo } from './inspection.repo'
import { InspectionResolver } from './inspection.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([InspectionGroupEntity, InspectionPointEntity])],
  providers: [InspectionService, InspectionRepo, InspectionResolver]
})
export class InspectionModule {}
