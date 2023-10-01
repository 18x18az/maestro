import { Module } from '@nestjs/common'
import { DisplaysController } from './displays.controller'
import { DisplaysService } from './displays.service'
import { DisplaysPublisher } from './displays.publisher'
import { PublishService } from 'src/utils/publish/publish.service'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import { DisplaysDatabase } from './displays.repo'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'

@Module({
  controllers: [DisplaysController],
  // @question not sure that this is correct (no experience with nestJS). I assume order doesn't matter 
  providers: [DisplaysService, DisplaysPublisher, PublishService, PrismaService, DisplaysDatabase, InMemoryDBService]
})
export class DisplaysModule {}
