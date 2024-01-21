import { Injectable, Logger } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'
import { LoadFieldEvent } from '../../field-control/load-field.event'
import { CONTROL_MODE } from '../../field-control/field-control.interface'
import { QueueSittingEvent } from './queue-sitting.event'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'
import { CompetitionFieldRepo } from './competition-field.repo'
import { StartFieldEvent } from '../../field-control/start-field.event'
import { StopFieldEvent } from '../../field-control/stop-field.event'
import { PeriodEndEvent } from './period-end.event'
import { PeriodStartEvent } from './period-start.event'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { EnableFieldEvent } from '../../field/enable-field.event'
import { TimingService } from './timing.service'

@Injectable()
export class CompetitionFieldControlService {
  private readonly logger: Logger = new Logger(CompetitionFieldControlService.name)

  constructor (
    private readonly loadField: LoadFieldEvent,
    private readonly queueEvent: QueueSittingEvent,
    private readonly removeEvent: RemoveOnTableSittingEvent,
    private readonly repo: CompetitionFieldRepo,
    private readonly startEvent: StartFieldEvent,
    private readonly stopEvent: StopFieldEvent,
    private readonly periodEndEvent: PeriodEndEvent,
    private readonly periodStartEvent: PeriodStartEvent,
    private readonly cache: CompetitionFieldControlCache,
    private readonly enableEvent: EnableFieldEvent,
    private readonly timing: TimingService
  ) {}

  onModuleInit (): void {
    this.queueEvent.registerAfter(async (data) => {
      if (data.location === 'ON_TABLE') return

      await this.putOnField(data.fieldId)
    })

    this.removeEvent.registerBefore(async (data) => {
      this.cache.remove(data.fieldId)
    })

    this.startEvent.registerBefore(async (data) => {
      const current = await this.cache.get(data.fieldId)

      if (current === MATCH_STAGE.EMPTY) return

      await this.periodStartEvent.execute({ fieldId: data.fieldId })
    })

    this.stopEvent.registerAfter(async (data) => {
      const current = await this.cache.get(data.fieldId)

      if (current === MATCH_STAGE.EMPTY) return

      await this.periodEndEvent.execute({ fieldId: data.fieldId })
    })

    this.enableEvent.registerOnComplete(async (data) => {
      const current = await this.cache.get(data.id)
      if (current === MATCH_STAGE.EMPTY) return

      this.logger.log(`Loaded with match on field ${data.id}`)
      await this.loadField.execute({ fieldId: data.id, mode: CONTROL_MODE.AUTO, duration: await this.timing.getAutonLength() })
    })
  }

  private async putOnField (fieldId: number): Promise<void> {
    this.cache.set(fieldId, MATCH_STAGE.QUEUED)
    await this.loadField.execute({ fieldId, mode: CONTROL_MODE.AUTO, duration: await this.timing.getAutonLength() })
  }
}
