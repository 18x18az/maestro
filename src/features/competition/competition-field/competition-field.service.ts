import { Injectable, Logger } from '@nestjs/common'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'
import { EnableFieldEvent } from '../../field/enable-field.event'
import { EnableCompetitionFieldEvent } from './enable-competition-field.event'
import { FieldEntity } from '../../field/field.entity'
import { DisableFieldEvent } from '../../field/disable-field.event'
import { QueueSittingEvent } from './queue-sitting.event'
import { SittingCompleteEvent } from '../match/sitting-complete.event'
import { RemoveOnFieldSittingEvent } from './remove-on-field-sitting.event'
import { SittingStatus } from '../match/match.interface'
import { MatchService } from '../match/match.service'
import { AutomationEnabledEvent } from '../competition/automation-enabled.event'
import { TableEmptyEvent } from './table-empty.event'
import { AutomationService } from '../competition/automation.service'

@Injectable()
export class CompetitionFieldService {
  private readonly logger = new Logger(CompetitionFieldService.name)
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly enableFieldEvent: EnableFieldEvent,
    private readonly enableCompFieldEvent: EnableCompetitionFieldEvent,
    private readonly disableFieldEvent: DisableFieldEvent,
    private readonly queueEvent: QueueSittingEvent,
    private readonly sittingCompleteEvent: SittingCompleteEvent,
    private readonly removeOnFieldEvent: RemoveOnFieldSittingEvent,
    private readonly automationEnabledEvent: AutomationEnabledEvent,
    private readonly matchService: MatchService,
    private readonly tableEmptyEvent: TableEmptyEvent,
    private readonly automation: AutomationService
  ) {}

  async getCompetitionField (fieldId: number): Promise<CompetitionFieldEntity | null> {
    return await this.repo.getCompetitionField(fieldId)
  }

  private async handleEnableField (field: FieldEntity): Promise<void> {
    const needsCompField = field.isCompetition && !field.skillsEnabled
    if (!needsCompField) return

    const existing = await this.repo.getCompetitionField(field.id)
    if (existing !== null) return

    await this.enableCompFieldEvent.execute({ field })
  }

  private async handleDisableField (field: FieldEntity): Promise<void> {
    const existing = await this.getCompetitionField(field.id)

    if (existing === null) return

    console.log('todo')
  }

  async onModuleInit (): Promise<void> {
    this.enableFieldEvent.registerAfter(this.handleEnableField.bind(this))
    this.disableFieldEvent.registerBefore(this.handleDisableField.bind(this))
    this.sittingCompleteEvent.registerAfter(async (data) => {
      const { fieldId, location } = await this.repo.getSittingLocation(data.sitting)

      if (location === 'ON_TABLE') throw new Error('Sitting is on table')

      await this.removeOnFieldEvent.execute({ fieldId })
    })

    this.automationEnabledEvent.registerAfter(async () => {
      this.logger.log('Filling all fields')
      const fields = await this.repo.getAllFields()
      for (const field of fields) {
        await this.fillField(field.fieldId)
      }
    })

    this.queueEvent.registerOnComplete(async (data) => {
      const onTable = await this.repo.getOnTableSitting(data.fieldId)
      if (onTable !== null) return
      await this.tableEmptyEvent.execute({ fieldId: data.fieldId })
    })

    this.tableEmptyEvent.registerOnComplete(async (data) => {
      if (!this.automation.getAutomationEnabled()) return
      await this.fillField(data.fieldId)
    })
  }

  async fillField (fieldId: number): Promise<void> {
    this.logger.log(`Filling field ${fieldId}`)
    const sitting = await this.repo.getOnTableSitting(fieldId)

    if (sitting !== null) return

    const nextSitting = await this.matchService.getNextSitting(fieldId)

    if (nextSitting === null) return

    await this.queueSitting(nextSitting, fieldId)
  }

  async queueSitting (sittingId: number, fieldId: number): Promise<CompetitionFieldEntity> {
    const result = await this.queueEvent.execute({ sittingId, fieldId })
    return result.field
  }

  async getNextField (fieldId: number): Promise<number> {
    const fields = await this.repo.getAllFields()
    const numFields = fields.length
    const index = fields.findIndex((f) => f.fieldId === fieldId)

    if (index === -1) throw new Error('Field does not exist')
    const nextIndex = (index + 1) % numFields
    return fields[nextIndex].fieldId
  }

  async getMatchStatus (fieldId: number): Promise<SittingStatus | null> {
    const sitting = await this.repo.getOnFieldSitting(fieldId)

    if (sitting === null) return null

    return sitting.status
  }

  async getStatus (): Promise<CompetitionFieldEntity[]> {
    return await this.repo.getAllFields()
  }
}
