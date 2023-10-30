import { Module } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { HttpModule } from '@nestjs/axios'
import { StorageModule } from '../storage'
import { TmController } from './tm.controller'
import { PublishModule } from '../publish'
import { TmPublisher } from './tm.publisher'

@Module({
  controllers: [TmController],
  imports: [HttpModule, StorageModule, PublishModule],
  providers: [TmInternal, TmPublisher]
})
export class TmModule {}
