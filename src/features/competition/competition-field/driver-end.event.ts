import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'

interface DriverEndPayload {
  fieldId: number
}

@Injectable()
export class DriverEndEvent extends EventService<DriverEndPayload, DriverEndPayload, DriverEndPayload> {
  constructor (
    private readonly cache: CompetitionFieldControlCache) { super() }

  async doExecute (data: DriverEndPayload): Promise<DriverEndPayload> {
    this.logger.log(`Driver ended on field ${data.fieldId}`)
    this.cache.set(data.fieldId, MATCH_STAGE.SCORING)
    return data
  }
}
