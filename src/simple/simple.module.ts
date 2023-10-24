import { Module } from '@nestjs/common'
import { SimpleService } from './simple.service'
import { SimplePublisher } from './simple.publisher'
import { StorageModule } from '@/utils/storage/storage.module'
import { PublishService } from '@/utils/publish/publish.service'
import { SimpleController } from './simple.controller'
import { HttpModule } from '@nestjs/axios'
import { SimpleRepo } from './simple.repo'

@Module({
  controllers: [SimpleController],
  imports: [StorageModule, HttpModule],
  providers: [SimpleService, SimplePublisher, PublishService, SimpleRepo]
})
export class SimpleModule {}
