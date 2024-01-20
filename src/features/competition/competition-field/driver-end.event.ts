import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { CompetitionFieldRepo } from './competition-field.repo'

interface DriverEndPayload {
  fieldId: number
}

interface DriverEndContext extends DriverEndPayload {
  sittingId: number
}

export interface DriverEndResult extends DriverEndContext { }

@Injectable()
export class DriverEndEvent extends EventService<DriverEndPayload, DriverEndContext, DriverEndResult> {
  constructor (
    private readonly cache: CompetitionFieldControlCache,
    private readonly repo: CompetitionFieldRepo
  ) { super() }

  protected async getContext (data: DriverEndPayload): Promise<DriverEndContext> {
    const sitting = await this.repo.getOnFieldSitting(data.fieldId)

    if (sitting === null) throw new Error(`No match found for field ${data.fieldId}`)

    return {
      ...data,
      sittingId: sitting.id
    }
  }

  async doExecute (data: DriverEndContext): Promise<DriverEndResult> {
    this.logger.log(`Driver ended on field ${data.fieldId}`)
    this.cache.set(data.fieldId, MATCH_STAGE.SCORING)
    return data
  }
}
