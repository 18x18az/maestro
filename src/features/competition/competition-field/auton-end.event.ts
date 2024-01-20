import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { LoadFieldEvent } from '../../field-control/load-field.event'
import { CONTROL_MODE } from '../../field-control/field-control.interface'

interface AutonEndPayload {
  fieldId: number
}

@Injectable()
export class AutonEndEvent extends EventService<AutonEndPayload, AutonEndPayload, AutonEndPayload> {
  constructor (
    private readonly cache: CompetitionFieldControlCache,
    private readonly loadField: LoadFieldEvent
  ) { super() }

  async doExecute (data: AutonEndPayload): Promise<AutonEndPayload> {
    this.logger.log(`Auton ended on field ${data.fieldId}`)
    this.cache.set(data.fieldId, MATCH_STAGE.SCORING_AUTON)
    await this.loadField.execute({ fieldId: data.fieldId, mode: CONTROL_MODE.DRIVER, duration: 105 * 1000 })
    return data
  }
}
