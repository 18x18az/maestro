import { Injectable } from '@nestjs/common'
import { CompetitionControlPublisher } from './competition.publisher'

@Injectable()
export class CompetitionControlCache {
  private liveField: number | null = null
  private onDeckField: number | null = null
  private automationEnabled: boolean = false

  constructor (private readonly publisher: CompetitionControlPublisher) { }

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishLiveField(this.liveField)
    await this.publisher.publishOnDeckField(this.onDeckField)
    await this.publisher.publishAutomation(this.automationEnabled)
  }

  public getLiveField (): number | null {
    return this.liveField
  }

  public getOnDeckField (): number | null {
    return this.onDeckField
  }

  async setLiveField (field: number | null): Promise<void> {
    this.liveField = field
    await this.publisher.publishLiveField(field)
  }

  async setOnDeckField (field: number | null): Promise<void> {
    this.onDeckField = field
    await this.publisher.publishOnDeckField(field)
  }

  async setAutomationEnabled (enabled: boolean): Promise<void> {
    this.automationEnabled = enabled
    await this.publisher.publishAutomation(this.automationEnabled)
  }

  isAutomationEnabled (): boolean {
    return this.automationEnabled
  }
}