import { MatchResult } from '@/utils'
import { Injectable } from '@nestjs/common'
import { FieldControlInternal } from './field-control.internal'

@Injectable()
export class FieldControlService {
  constructor (private readonly service: FieldControlInternal) { }

  async handleMatchResults (results: MatchResult[]): Promise<void> {
    // await this.service.handleMatchResults(results)
  }
}
