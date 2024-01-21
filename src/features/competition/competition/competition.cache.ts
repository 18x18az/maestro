import { Injectable } from '@nestjs/common'

@Injectable()
export class CompetitionControlCache {
  private liveField: number | null = null
  private onDeckField: number | null = null

  getLiveField (): number | null {
    return this.liveField
  }

  getOnDeckField (): number | null {
    return this.onDeckField
  }

  async setLiveField (fieldId: number | null): Promise<void> {
    this.liveField = fieldId
  }

  async setOnDeckField (fieldId: number | null): Promise<void> {
    this.onDeckField = fieldId
  }
}
