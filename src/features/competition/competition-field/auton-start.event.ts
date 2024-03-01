import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'

export interface AutonStartPayload {
  fieldId: number
}

@Injectable()
export class AutonStartEvent extends EventService<AutonStartPayload, AutonStartPayload, AutonStartPayload> {
  constructor (private readonly cache: CompetitionFieldControlCache) { super() }
  async doExecute (data: AutonStartPayload): Promise<AutonStartPayload> {
    this.logger.log(`Auton started on field ${data.fieldId}`)
    this.cache.set(data.fieldId, MATCH_STAGE.AUTON)
    return data
  }
}
