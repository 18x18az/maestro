import { Module } from '@nestjs/common'
import { DisplaysController } from './displays.controller'
import { DisplaysService } from './displays.service'
import { DisplaysPublisher } from './displays.publisher'
import { PublishService } from 'src/utils/publish/publish.service'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import { DisplaysDatabase } from './displays.repo'

// @question should something be exported (at the moment the database is only written to)
// Currently, data is exposed when a field is assigned, at which point, the field data is published to 'displays/:uuid'
@Module({
  controllers: [DisplaysController],
  providers: [DisplaysService, DisplaysPublisher, PublishService, PrismaService, DisplaysDatabase]
})
export class DisplaysModule {}
