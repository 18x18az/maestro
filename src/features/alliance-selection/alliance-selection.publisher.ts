import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { AllianceSelectionStatus } from './alliance-selection.interfaces'

@Injectable()
export class AllianceSelectionPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishStatus (status: AllianceSelectionStatus | null): Promise<void> {
    await this.publisher.broadcast('allianceSelection', status)
  }
}
