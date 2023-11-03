import { Module } from '@nestjs/common'
import { AllianceSelectionController } from './alliance-selection.controller'
import { AllianceSelectionInternal } from './alliance-selection.internal'
import { PublishModule, TmModule } from '@/utils'
import { AllianceSelectionPublisher } from './alliance-selection.publisher'

@Module({
  imports: [TmModule, PublishModule],
  controllers: [AllianceSelectionController],
  providers: [AllianceSelectionInternal, AllianceSelectionPublisher]
})
export class AllianceSelectionModule {}
