import { Injectable, Logger } from '@nestjs/common'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'
import { EnableFieldEvent } from '../../field/enable-field.event'
import { EnableCompetitionFieldEvent } from './enable-competition-field.event'
import { FieldEntity } from '../../field/field.entity'
import { DisableFieldEvent } from '../../field/disable-field.event'
import { QueueSittingEvent } from './queue-sitting.event'

@Injectable()
export class CompetitionFieldService {
  private readonly logger = new Logger(CompetitionFieldService.name)
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly enableFieldEvent: EnableFieldEvent,
    private readonly enableCompFieldEvent: EnableCompetitionFieldEvent,
    private readonly disableFieldEvent: DisableFieldEvent,
    private readonly queueEvent: QueueSittingEvent
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
  }

  async queueSitting (sittingId: number, fieldId: number): Promise<CompetitionFieldEntity> {
    const result = await this.queueEvent.execute({ sittingId, fieldId })
    return result.field
  }
}
