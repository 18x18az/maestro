import { Module } from '@nestjs/common'
import { StorageModule } from '../../../utils/storage'
import { SwitcherModule } from '../switcher/switcher.module'
import { SolidDisplayResolver } from './solid-display.resolver'
import { SolidDisplayService } from './solid-display.service'

@Module({
  imports: [StorageModule, SwitcherModule],
  providers: [SolidDisplayService, SolidDisplayResolver]
})
export class SolidDisplayModule {}
