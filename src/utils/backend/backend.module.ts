import { Module } from '@nestjs/common'
import { StorageModule } from '../storage'
import { BackendService } from './backend.service'
import { BackendResolver } from './backend.resolver'

@Module({
  imports: [StorageModule],
  providers: [BackendService, BackendResolver]
})
export class BackendModule {}
