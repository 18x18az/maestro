import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { AutonStartEvent } from './auton-start.event'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { DriverStartEvent } from './driver-start.event'

interface PeriodStartPayload {
  fieldId: number
}

interface PeriodStartContext extends PeriodStartPayload {
  current: MATCH_STAGE
}

@Injectable()
export class PeriodStartEvent extends EventService<PeriodStartPayload, PeriodStartContext, PeriodStartContext> {
  constructor (
    private readonly cache: CompetitionFieldControlCache,
    private readonly autonStart: AutonStartEvent,
    private readonly driverStart: DriverStartEvent
  ) { super() }

  protected async getContext (data: PeriodStartPayload): Promise<PeriodStartContext> {
    const current = this.cache.get(data.fieldId)
    return { ...data, current }
  }

  protected async doExecute (data: PeriodStartContext): Promise<PeriodStartContext> {
    const { current } = data

    if (current === MATCH_STAGE.EMPTY) throw new Error('Period start event called on empty field')

    if (current === MATCH_STAGE.QUEUED) {
      await this.autonStart.execute({ fieldId: data.fieldId })
    } else if (current === MATCH_STAGE.SCORING_AUTON) {
      await this.driverStart.execute({ fieldId: data.fieldId })
    } else {
      throw new BadRequestException(`Invalid match stage ${current}`)
    }

    return data
  }
}
