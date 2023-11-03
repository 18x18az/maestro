import { Module } from '@nestjs/common'
import { DisplayController } from './display.controller'
import { DisplayService } from './display.service'
import { DisplayPublisher } from './display.publisher'
import { DisplayDatabase } from './display.repo'
import { PrismaModule, PublishModule } from '@/utils'

// @question should something be exported (at the moment the database is only written to)
// Currently, data is exposed when a field is assigned, at which point, the field data is published to 'displays/:uuid'
@Module({
  imports: [PrismaModule, PublishModule],
  controllers: [DisplayController],
  providers: [DisplayService, DisplayPublisher, DisplayDatabase]
})
export class DisplayModule {}
