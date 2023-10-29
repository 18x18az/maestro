import { Module } from '@nestjs/common'
import { SetupController } from './setup.controller'
import { FieldModule } from '@/features/devices/field'
import { SetupService } from './setup.service'
import { SetupPublisher } from './setup.publisher'
import { StorageModule } from '@/old_utils/storage/storage.module'
import { PublishModule } from '@/old_utils/publish/publish.module'

@Module({
  imports: [FieldModule, StorageModule, PublishModule],
  controllers: [SetupController],
  providers: [SetupService, SetupPublisher]
})
export class SetupModule {}
