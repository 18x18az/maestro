import { Injectable, Logger } from '@nestjs/common'
import { FieldService } from '../field/field.service'
import { AutomationState } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'
import { Match, MatchService } from '../match'
import { StorageService } from '@/utils'
import { EventStage, StageService } from '../stage'
import { FieldStatusService } from './field-status.service'
import { MatchManager } from './match-manager.service'

@Injectable()
export class FieldControlInternal {
  private readonly logger: Logger = new Logger(FieldControlInternal.name)

  private automation: AutomationState

  constructor (
    private readonly fields: FieldService,
    private readonly publisher: FieldControlPublisher,
    private readonly match: MatchService,
    private readonly storage: StorageService,
    private readonly stage: StageService,
    private readonly status: FieldStatusService,
    private readonly manager: MatchManager
  ) { }

  async onApplicationBootstrap (): Promise<void> {
    const initialStatus = await this.status.getAll()
    const stage = this.stage.getStage()

    await this.publisher.publishActiveField(null)
    await this.publisher.publishNextField(null)

    const fields = await this.fields.getCompetitionFields()
    for (const field of fields) {
      await this.publisher.publishFieldStatus(await this.status.get(field.id))
    }

    const automation = await this.storage.getEphemeral('automation', AutomationState.ENABLED) as AutomationState
    await this.setAutomation(automation)
    this.logger.log(`Automation state: ${this.automation}`)

    // get all non null matches either in match or on deck
    const matches = initialStatus.flatMap(status => {
      const nonNullMatches: Match[] = []
      if (status.match !== null) {
        nonNullMatches.push(status.match)
      }
      if (status.onDeck !== null) {
        nonNullMatches.push(status.onDeck)
      }
      return nonNullMatches
    })

    if (stage === EventStage.QUALIFICATIONS) {
      await this.match.reconcileQueued(matches)
      await this.publisher.publishFieldStatuses(initialStatus)

      for (const status of initialStatus) {
        await this.analyzeField(status.field.id)
      }
    }
  }

  private async analyzeFields (): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    for (const field of fields) {
      await this.analyzeField(field.id)
    }
  }

  async setAutomation (state: AutomationState): Promise<void> {
    this.logger.log(`Setting automation state to ${state}`)
    this.automation = state
    await this.storage.setEphemeral('automation', state)
    await this.publisher.publishAutomationState(state)

    const stage = this.stage.getStage()
    const isQualOrElims = stage === EventStage.QUALIFICATIONS || stage === EventStage.ELIMS

    if (state === AutomationState.ENABLED && isQualOrElims) {
      await this.analyzeFields()
    }
  }

  async onManualAction (): Promise<void> {
    if (this.automation === AutomationState.ENABLED) {
      this.logger.log('Manual action detected, disabling automation')
      await this.setAutomation(AutomationState.CAN_ENABLE)
    }
  }

  private async analyzeField (fieldId: number): Promise<void> {
    if (this.automation !== AutomationState.ENABLED) {
      return
    }

    const status = await this.status.get(fieldId)

    if (status.onDeck !== null) {
      return
    }

    this.logger.log(`Field ${status.field.name} has no match on deck`)

    const unqueuedMatches = await this.match.getUnqueuedMatches()

    // find first match that either has a matching field id or a null field id
    const match = unqueuedMatches.find(match => match.fieldId === null || match.fieldId === status.field.id)

    if (match === undefined) {
      this.logger.log(`No remaining matches found for field ${status.field.name}`)
      return
    }

    await this.manager.add(status.field.id, match.id)
  }
}
