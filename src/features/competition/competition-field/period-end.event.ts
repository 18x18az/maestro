import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { AutonEndEvent } from './auton-end.event'
import { DriverEndEvent } from './driver-end.event'

interface PeriodEndPayload {
  fieldId: number
}

interface PeriodEndContext extends PeriodEndPayload {
  current: MATCH_STAGE
}

@Injectable()
export class PeriodEndEvent extends EventService<PeriodEndPayload, PeriodEndContext, PeriodEndContext> {
  constructor (
    private readonly cache: CompetitionFieldControlCache,
    private readonly autonEnd: AutonEndEvent,
    private readonly driverEnd: DriverEndEvent
  ) { super() }

  protected async getContext (data: PeriodEndPayload): Promise<PeriodEndContext> {
    const current = this.cache.get(data.fieldId)
    return { ...data, current }
  }

  protected async doExecute (data: PeriodEndContext): Promise<PeriodEndContext> {
    const { current } = data

    if (current === MATCH_STAGE.EMPTY) throw new Error('Period end event called on empty field')

    if (current === MATCH_STAGE.AUTON) {
      await this.autonEnd.execute({ fieldId: data.fieldId })
    } else if (current === MATCH_STAGE.DRIVER) {
      await this.driverEnd.execute({ fieldId: data.fieldId })
    } else {
      throw new BadRequestException(`Invalid match stage ${current}`)
    }

    return data
  }
}
