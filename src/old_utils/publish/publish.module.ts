import { Module } from '@nestjs/common'
import { PublishService } from './publish.service'
import { PigeonModule } from '@alecmmiller/pigeon-mqtt-nest'

@Module({
  providers: [PublishService, PigeonModule],
  exports: [PublishService]
})
export class PublishModule {}
