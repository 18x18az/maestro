import { Injectable, Logger } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { FieldEntity } from '../../field/field.entity'
import { FieldService } from '../../field/field.service'
import { OnDeckRemovedEvent } from './on-deck-removed.event'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { SittingStatus } from '../match/match.interface'
import { OnDeckEvent } from './on-deck.event'
import { Competition } from './competition.object'

@Injectable()
export class CompetitionControlService {
  private readonly logger = new Logger(CompetitionControlService.name)

  constructor (
    private readonly cache: CompetitionControlCache,
    private readonly fieldService: FieldService,
    private readonly compFields: CompetitionFieldService,
    private readonly onDeckRemoved: OnDeckRemovedEvent,
    private readonly onDeck: OnDeckEvent
  ) {}

  onModuleInit (): void {
    this.onDeckRemoved.registerOnComplete(async (data) => {
      const removedFieldId = data.fieldId
      const nextFieldId = await this.compFields.getNextField(removedFieldId)
      const status = await this.compFields.getMatchStatus(nextFieldId)

      if (status !== SittingStatus.QUEUED) return

      await this.onDeck.execute({ fieldId: nextFieldId })
    })
  }

  async getLiveField (): Promise<FieldEntity | null> {
    const id = this.cache.getLiveField()

    if (id === null) return null

    return await this.fieldService.getField(id)
  }

  async getOnDeckField (): Promise<FieldEntity | null> {
    const id = this.cache.getOnDeckField()

    if (id === null) return null

    return await this.fieldService.getField(id)
  }

  getCompetitionInformation (): Competition {
    return {
      automationEnabled: this.cache.getAutomationEnabled()
    }
  }
}
