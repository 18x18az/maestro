import { Module } from '@nestjs/common'
import { StorageModule } from '../../../utils/storage'
import { OverlayService } from './overlay.service'
import { OverlayResolver } from './overlay.resolver'

@Module({
  imports: [StorageModule],
  providers: [OverlayService, OverlayResolver]
})
export class OverlayModule {}
