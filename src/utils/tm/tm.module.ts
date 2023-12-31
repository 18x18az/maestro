import { Module } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { HttpModule } from '@nestjs/axios'
import { StorageModule } from '../storage'
import { TmService } from './tm.service'
import { StatusModule } from '../status'
import { TmResolver } from './tm.resolver'
import { TmConnectedEvent } from './tm-connected.event'

@Module({
  imports: [HttpModule, StorageModule, StatusModule],
  providers: [TmInternal, TmService, TmResolver, TmConnectedEvent],
  exports: [TmService, TmConnectedEvent]
})
export class TmModule {}
