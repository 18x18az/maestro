import { Module } from '@nestjs/common'
import { StorageModule } from '../storage'
import { BackendService } from './backend.service'
import { BackendResolver } from './backend.resolver'
import { TeamModule } from '../../features/team/team.module'

@Module({
  imports: [StorageModule, TeamModule],
  providers: [BackendService, BackendResolver]
})
export class BackendModule {}
