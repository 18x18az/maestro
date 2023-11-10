import { MatchResult } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import { MatchManager } from './match-manager.service'

@Injectable()
export class FieldControlService {
  private readonly logger = new Logger(FieldControlService.name)

  constructor (
    private readonly manager: MatchManager
  ) { }

  async handleMatchResults (results: MatchResult[]): Promise<void> {
    await this.manager.gotResults(results)
  }
}
