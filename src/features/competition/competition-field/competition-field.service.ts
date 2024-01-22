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
    private readonly removeOnFieldEvent: RemoveOnFieldSittingEvent
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
}
