import { Injectable } from '@nestjs/common'
import { PublishService } from '@/utils'
import { Match } from '../match'

export interface PublishMatchResult {
  match: Match
  redScore: number
  blueScore: number
}

@Injectable()
export class CompetitionControlPublisher {
  constructor (private readonly publisher: PublishService) { }

  public async publishLiveField (fieldId: number | null): Promise<void> {
    await this.publisher.broadcast('liveField', { fieldId })
  }

  public async publishOnDeckField (fieldId: number | null): Promise<void> {
    await this.publisher.broadcast('onDeckField', { fieldId })
  }

  public async publishAutomation (enabled: boolean): Promise<void> {
    await this.publisher.broadcast('automation', { enabled })
  }

  async publishMatchResult (result: PublishMatchResult | null): Promise<void> {
    await this.publisher.broadcast('results', result)
  }

  async publishSkillsEnabled (enabled: boolean): Promise<void> {
    await this.publisher.broadcast('skillsEnabled', { enabled })
  }

  async publishTimeout (endTime: Date | null): Promise<void> {
    const dateString = endTime === null ? null : endTime.toISOString()
    await this.publisher.broadcast('timeout', { endTime: dateString })
  }
}
