import { Module, forwardRef } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { HttpModule } from '@nestjs/axios'
import { StorageModule } from '../storage'
import { TmResolver } from './tm.resolver'
import { TmConnectedEvent } from './tm-connected.event'
import { TeamModule } from '../../features/team/team.module'
import { StageModule } from '../../features/stage/stage.module'

@Module({
  imports: [HttpModule, StorageModule, forwardRef(() => TeamModule), StageModule],
  providers: [TmInternal, TmResolver, TmConnectedEvent],
  exports: [TmConnectedEvent]
})
export class TmModule {}
