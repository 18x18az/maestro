import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { RemoveOnFieldSittingEvent } from './remove-sitting.event'

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
    private readonly removeOnField: RemoveOnFieldSittingEvent
  ) { super() }

  protected async getContext (data: UnqueueSittingPayload): Promise<UnqueueSittingContext> {
    const location = await this.repo.getSittingLocation(data.sittingId)
    return {
      ...data,
      ...location
    }
  }

  protected async doExecute (data: UnqueueSittingContext): Promise<UnqueueSittingContext> {
    if (data.location === 'ON_FIELD') {
      await this.removeOnField.execute({ fieldId: data.fieldId })
    } else {
      // await this.repo.removeOnTableSitting(data.fieldId)
    }
    return data
  }
}
