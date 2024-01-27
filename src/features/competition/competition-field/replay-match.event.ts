import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { RemoveOnFieldSittingEvent } from './remove-on-field-sitting.event'

interface ReplayMatchPayload {
  sittingId: number
}

interface ReplayMatchContext extends ReplayMatchPayload {
  fieldId: number
}

@Injectable()
export class ReplayMatchEvent extends EventService<ReplayMatchPayload, ReplayMatchContext, ReplayMatchContext> {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly removeEvent: RemoveOnFieldSittingEvent
  ) { super() }

  protected async getContext (data: ReplayMatchPayload): Promise<ReplayMatchContext> {
    const field = await this.repo.getSittingLocation(data.sittingId)

    if (field === null) throw new BadRequestException('Sitting not found on any field')
    if (field.location === 'ON_TABLE') throw new BadRequestException('Sitting is not on field')

    this.logger.log(`Replaying sitting ${data.sittingId} on field ${field.fieldId}`)

    return {
      ...data,
      fieldId: field.fieldId
    }
  }

  protected async doExecute (data: ReplayMatchContext): Promise<ReplayMatchContext> {
    await this.removeEvent.execute(data)
    return data
  }
}
