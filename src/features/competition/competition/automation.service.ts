import { Injectable } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'

@Injectable()
export class AutomationService {
  constructor (private readonly cache: CompetitionControlCache) { }

  getAutomationEnabled (): boolean {
    return this.cache.getAutomationEnabled()
  }
}
