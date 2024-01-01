import { Module } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { HttpModule } from '@nestjs/axios'
import { StorageModule } from '../storage'
import { TmService } from './tm.service'
import { TmResolver } from './tm.resolver'
import { TmConnectedEvent } from './tm-connected.event'
import { TeamModule } from '../../features/team/team.module'

@Module({
  imports: [HttpModule, StorageModule, TeamModule],
  providers: [TmInternal, TmService, TmResolver, TmConnectedEvent],
  exports: [TmService, TmConnectedEvent]
})
export class TmModule {}
