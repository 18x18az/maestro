import { PublishModule, StorageModule } from '@/utils'
import { Module } from '@nestjs/common'
import { StageInternal } from './stage.internal'
import { StageController } from './stage.controller'

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [StageController],
  providers: [StageInternal]
})
export class StageModule {}
