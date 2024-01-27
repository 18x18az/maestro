import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { RemoveOnFieldSittingEvent } from './remove-on-field-sitting.event'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'

interface UnqueueSittingPayload {
  sittingId: number
}

interface UnqueueSittingContext extends UnqueueSittingPayload {
  fieldId: number
  location: 'ON_TABLE' | 'ON_FIELD'
}

@Injectable()
export class UnqueueSittingEvent extends EventService<UnqueueSittingPayload, UnqueueSittingContext, UnqueueSittingContext> {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly removeOnField: RemoveOnFieldSittingEvent,
    private readonly removeOnTable: RemoveOnTableSittingEvent
  ) { super() }

  protected async getContext (data: UnqueueSittingPayload): Promise<UnqueueSittingContext> {
    const location = await this.repo.getSittingLocation(data.sittingId)
    return {
      ...data,
      ...location
    }
  }

  protected async doExecute (data: UnqueueSittingContext): Promise<UnqueueSittingContext> {
    this.logger.log(`Unqueueing sitting ${data.sittingId} from ${data.location} of field ${data.fieldId}`)
    if (data.location === 'ON_FIELD') {
      await this.removeOnField.execute({ fieldId: data.fieldId })
    } else {
      await this.removeOnTable.execute({ fieldId: data.fieldId })
    }
    return data
  }
}
