import { Module } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { HttpModule } from '@nestjs/axios'
import { StorageModule } from '../storage'
import { TmController } from './tm.controller'
import { TmPublisher } from './tm.publisher'
import { TmService } from './tm.service'
import { StatusModule } from '../status'

@Module({
  controllers: [TmController],
  imports: [HttpModule, StorageModule, StatusModule],
  providers: [TmInternal, TmPublisher, TmService],
  exports: [TmService]
})
export class TmModule {}
