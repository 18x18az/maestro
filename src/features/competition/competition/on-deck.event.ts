import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { CompetitionControlCache } from './competition.cache'

interface OnDeckEventPayload {
  fieldId: number
}

interface OnDeckEventContext extends OnDeckEventPayload {
  sittingId: number
}

@Injectable()
export class OnDeckEvent extends EventService<OnDeckEventPayload, OnDeckEventContext, OnDeckEventContext> {
  constructor (
    private readonly fieldService: CompetitionFieldService,
    private readonly cache: CompetitionControlCache
  ) { super() }

  protected async getContext (data: OnDeckEventPayload): Promise<OnDeckEventContext> {
    const fieldInfo = await this.fieldService.getCompetitionField(data.fieldId)

    if (fieldInfo === null) throw new BadRequestException('Field does not exist')

    const sittingId = fieldInfo.onFieldSittingId

    if (sittingId === null) throw new BadRequestException('Field is not occupied')

    return {
      ...data,
      sittingId
    }
  }

  protected async doExecute (data: OnDeckEventContext): Promise<OnDeckEventContext> {
    this.logger.log(`Putting field ${data.fieldId} on deck`)
    await this.cache.setOnDeckField(data.fieldId)
    return data
  }
}
