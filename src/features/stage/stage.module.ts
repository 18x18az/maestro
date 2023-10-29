import { PublishModule, StorageModule } from '@/utils'
import { Module } from '@nestjs/common'
import { InternalService } from './stage.internal'

@Module({
  imports: [StorageModule, PublishModule],
  providers: [InternalService]
})
export class StageModule {}
