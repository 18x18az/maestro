import { Injectable, Logger } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'
import { LoadFieldEvent } from '../../field-control/load-field.event'
import { CONTROL_MODE } from '../../field-control/field-control.interface'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'
import { StartFieldEvent } from '../../field-control/start-field.event'
import { StopFieldEvent } from '../../field-control/stop-field.event'
import { PeriodEndEvent } from './period-end.event'
import { PeriodStartEvent } from './period-start.event'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { EnableFieldEvent } from '../../field/enable-field.event'
import { TimingService } from './timing.service'
import { OnFieldEvent } from './on-field.event'

@Injectable()
export class CompetitionFieldControlService {
  private readonly logger: Logger = new Logger(CompetitionFieldControlService.name)

  constructor (
    private readonly loadField: LoadFieldEvent,
    private readonly removeEvent: RemoveOnTableSittingEvent,
    private readonly startEvent: StartFieldEvent,
    private readonly stopEvent: StopFieldEvent,
    private readonly periodEndEvent: PeriodEndEvent,
    private readonly periodStartEvent: PeriodStartEvent,
    private readonly cache: CompetitionFieldControlCache,
    private readonly enableEvent: EnableFieldEvent,
    private readonly timing: TimingService,
    private readonly onField: OnFieldEvent
  ) {}

  onModuleInit (): void {
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
      if (current === MATCH_STAGE.SCORING) return

      this.logger.log(`Loaded with match on field ${data.id}`)
      await this.loadField.execute({ fieldId: data.id, mode: CONTROL_MODE.AUTO, duration: await this.timing.getAutonLength() })
    })

    this.onField.registerAfter(async (data) => {
      await this.loadField.execute({ fieldId: data.fieldId, mode: CONTROL_MODE.AUTO, duration: await this.timing.getAutonLength() })
    })
  }
}
