import { Module, forwardRef } from '@nestjs/common'
import { StorageModule } from '../../../utils/storage'
import { SwitcherModule } from '../switcher/switcher.module'
import { SolidDisplayResolver } from './solid-display.resolver'
import { SolidDisplayService } from './solid-display.service'
import { SolidDisplayRepo } from './solid-display.repo'

@Module({
  imports: [
    StorageModule,
    forwardRef(() => SwitcherModule)
  ],
  providers: [SolidDisplayService, SolidDisplayResolver, SolidDisplayRepo],
  exports: [SolidDisplayService, SolidDisplayRepo]
})
export class SolidDisplayModule {}
