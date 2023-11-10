import { PublishModule, StorageModule } from '@/utils'
import { Module } from '@nestjs/common'
import { StageInternal } from './stage.internal'
import { StageController } from './stage.controller'
import { StageService } from './stage.service'
import { StagePublisher } from './stage.publisher'
import { StageRepo } from './stage.repo'

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [StageController],
  providers: [StageInternal, StageService, StagePublisher, StageRepo],
  exports: [StageService]
})
export class StageModule {}
