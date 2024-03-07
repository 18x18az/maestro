import { Module } from '@nestjs/common'
import { StorageModule } from '../../../utils/storage'
import { OverlayService } from './overlay.service'
import { OverlayResolver } from './overlay.resolver'
import { AwardModule } from '../../award/award.module'

@Module({
  imports: [StorageModule, AwardModule],
  providers: [OverlayService, OverlayResolver]
})
export class OverlayModule {}
