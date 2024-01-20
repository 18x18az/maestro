import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'

interface DriverStartPayload {
  fieldId: number
}

@Injectable()
export class DriverStartEvent extends EventService<DriverStartPayload, DriverStartPayload, DriverStartPayload> {
  constructor (private readonly cache: CompetitionFieldControlCache) { super() }
  async doExecute (data: DriverStartPayload): Promise<DriverStartPayload> {
    this.logger.log(`Driver started on field ${data.fieldId}`)
    this.cache.set(data.fieldId, MATCH_STAGE.DRIVER)
    return data
  }
}
