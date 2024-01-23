import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionControlCache } from './competition.cache'

@Injectable()
export class AutomationDisabledEvent extends EventService<void, void, void> {
  constructor (private readonly cache: CompetitionControlCache) {
    super()
  }

  protected async doExecute (): Promise<void> {
    this.logger.log('Automation disabled')
    this.cache.setAutomationEnabled(false)
  }
}
