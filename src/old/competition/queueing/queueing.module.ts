import { Module } from '@nestjs/common'
import { QueueingController } from './queueing.controller'
import { QueueingService } from './queueing.service'
import { QueueingPublisher } from './queueing.publisher'
import { PublishModule } from '@/old_utils/publish/publish.module'

@Module({
  controllers: [QueueingController],
  providers: [QueueingService, QueueingPublisher],
  imports: [PublishModule]
})
export class QueueingModule {}
