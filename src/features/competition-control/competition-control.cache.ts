import { Injectable } from '@nestjs/common'
import { CompetitionControlPublisher } from './competition-control.publisher'

@Injectable()
export class CompetitionControlCache {
  private currentField: number | null = null
  private onDeckField: number | null = null

  constructor (private readonly publisher: CompetitionControlPublisher) { }

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishCurrentField(this.currentField)
    await this.publisher.publishOnDeckField(this.onDeckField)
  }

  public getCurrentField (): number | null {
    return this.currentField
  }

  public getOnDeckField (): number | null {
    return this.onDeckField
  }

  async setCurrentField (field: number | null): Promise<void> {
    this.currentField = field
    await this.publisher.publishCurrentField(field)
  }

  async setOnDeckField (field: number | null): Promise<void> {
    this.onDeckField = field
    await this.publisher.publishOnDeckField(field)
  }
}
