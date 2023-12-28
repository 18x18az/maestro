import { PublishModule, StorageModule } from '@/utils'
import { Module } from '@nestjs/common'
import { StageService } from './stage.service'
import { StageResolver } from './stage.resolver'

@Module({
  imports: [StorageModule, PublishModule],
  providers: [StageService, StageResolver],
  exports: [StageService]
})
export class StageModule {}
