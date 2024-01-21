import { Module } from '@nestjs/common'
import { AllianceSelectionInternal } from './alliance-selection.internal'
import { PublishModule, TmModule } from '@/utils'
import { AllianceSelectionPublisher } from './alliance-selection.publisher'

@Module({
  imports: [TmModule, PublishModule],
  providers: [AllianceSelectionInternal, AllianceSelectionPublisher]
})
export class AllianceSelectionModule {}
