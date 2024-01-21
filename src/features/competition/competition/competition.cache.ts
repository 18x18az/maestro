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

  setLiveField (fieldId: number | null): void {
    this.liveField = fieldId
  }

  setOnDeckField (fieldId: number | null): void {
    this.onDeckField = fieldId
  }
}
