import { MatchResult } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import { MatchManager } from './match-manager.service'
import { ResultManager } from './result-manager.service'
import { DisplayedResults } from '../stream'

@Injectable()
export class FieldControlService {
  private readonly logger = new Logger(FieldControlService.name)

  constructor (
    private readonly manager: MatchManager,
    private readonly results: ResultManager
  ) { }

  async handleMatchResults (results: MatchResult[]): Promise<void> {
    await this.manager.gotResults(results)
  }

  getResults (): DisplayedResults | null {
    return this.results.get()
  }

  clearResults (): void {
    this.results.clear()
  }
}
