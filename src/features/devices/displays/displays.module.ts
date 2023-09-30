import { Module } from '@nestjs/common'
import { DisplaysController } from './displays.controller'
import { DisplaysService } from './displays.service'
import { DispplaysPublisher } from './displays.publisher'
import { PublishService } from 'src/utils/publish/publish.service'

@Module({
  controllers: [DisplaysController],
  providers: [DisplaysService, DispplaysPublisher, PublishService]
})
export class DisplaysModule {}
