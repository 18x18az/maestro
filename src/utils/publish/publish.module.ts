import { Module } from '@nestjs/common'
import { PublishService } from './publish.service'
import { PigeonModule } from '@alecmmiller/pigeon-mqtt-nest'

@Module({
  providers: [PigeonModule, PublishService],
  exports: [PublishService]
})
export class PublishModule {}
