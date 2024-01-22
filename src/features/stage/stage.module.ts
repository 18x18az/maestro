import { Module, forwardRef } from '@nestjs/common'
import { StageService } from './stage.service'
import { StageResolver } from './stage.resolver'
import { EventResetEvent } from './event-reset.event'
import { StageInternal } from './stage.internal'
import { SettingsModule } from '../../utils/settings/settings.module'
import { TeamModule } from '../team/team.module'
import { StorageModule } from '../../utils/storage'

@Module({
  imports: [StorageModule, SettingsModule, forwardRef(() => TeamModule)],
  providers: [StageService, StageResolver, EventResetEvent, StageInternal],
  exports: [StageService, EventResetEvent]
})
export class StageModule {}
