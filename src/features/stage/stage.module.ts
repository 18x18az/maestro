import { PublishModule, StorageModule } from '@/utils'
import { Module } from '@nestjs/common'
import { StageInternal } from './stage.internal'
import { StageController } from './stage.controller'
import { StageService } from './stage.service'
import { StagePublisher } from './stage.publisher'

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [StageController],
  providers: [StageInternal, StageService, StagePublisher],
  exports: [StageService]
})
export class StageModule {}
