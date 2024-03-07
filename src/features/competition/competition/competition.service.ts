import { Injectable, Logger } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { FieldEntity } from '../../field/field.entity'
import { FieldService } from '../../field/field.service'
import { OnDeckRemovedEvent } from './on-deck-removed.event'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { SittingStatus } from '../match/match.interface'
import { OnDeckEvent } from './on-deck.event'
import { Competition } from './competition.object'
import { MatchResultEvent } from '../match/match-result.event'
import { DriverEndEvent } from '../competition-field/driver-end.event'
import { LiveRemovedEvent } from './live-removed.event'
import { StorageService } from '../../../utils/storage'

const AUTO_RESULTS_KEY = 'autoResults'

@Injectable()
export class CompetitionControlService {
  private readonly logger = new Logger(CompetitionControlService.name)

  constructor (
    private readonly cache: CompetitionControlCache,
    private readonly fieldService: FieldService,
    private readonly compFields: CompetitionFieldService,
    private readonly onDeckRemoved: OnDeckRemovedEvent,
    private readonly onDeck: OnDeckEvent,
    private readonly matchScored: MatchResultEvent,
    private readonly driverEnd: DriverEndEvent,
    private readonly liveRemoved: LiveRemovedEvent,
    private readonly storage: StorageService
  ) {}

  onModuleInit (): void {
    this.onDeckRemoved.registerOnComplete(async (data) => {
      const removedFieldId = data.fieldId
      const nextFieldId = await this.compFields.getNextField(removedFieldId)
      const status = await this.compFields.getMatchStatus(nextFieldId)

      if (status !== SittingStatus.QUEUED) return

      await this.onDeck.execute({ fieldId: nextFieldId })
    })

    this.matchScored.registerOnComplete(async (data) => {
      const currentId = this.cache.getLiveField()

      if (currentId === null) return

      const nextFieldId = await this.compFields.getNextField(currentId)
      const status = await this.compFields.getMatchStatus(nextFieldId)

      if (status !== SittingStatus.QUEUED) return

      await this.onDeck.execute({ fieldId: nextFieldId })
    })

    this.driverEnd.registerAfter(async () => {
      setTimeout(() => {
        void this.liveRemoved.execute({})
      }, 3000)
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

  async shouldAutoAdvance (): Promise<boolean> {
    const autoAdvance = await this.storage.getEphemeral(AUTO_RESULTS_KEY, 'true')
    return autoAdvance === 'true'
  }

  async setAutoAdvance (autoAdvance: boolean): Promise<void> {
    await this.storage.setEphemeral(AUTO_RESULTS_KEY, autoAdvance ? 'true' : 'false')
  }

  async getCompetitionInformation (): Promise<Competition> {
    return {
      autoAdvance: await this.shouldAutoAdvance(),
      automationEnabled: this.cache.getAutomationEnabled()
    }
  }
}
