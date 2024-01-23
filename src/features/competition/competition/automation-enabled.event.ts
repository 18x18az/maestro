import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionControlCache } from './competition.cache'

@Injectable()
export class AutomationEnabledEvent extends EventService<void, void, void> {
  constructor (private readonly cache: CompetitionControlCache) {
    super()
  }

  protected async doExecute (): Promise<void> {
    this.logger.log('Automation enabled')
    this.cache.setAutomationEnabled(true)
  }
}
