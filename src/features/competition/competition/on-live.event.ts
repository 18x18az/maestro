import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { CompetitionControlCache } from './competition.cache'
import { OnDeckRemovedEvent } from './on-deck-removed.event'

interface OnLiveEventContext {
  fieldId: number
  sittingId: number
}

@Injectable()
export class OnLiveEvent extends EventService<{}, OnLiveEventContext, OnLiveEventContext> {
  constructor (
    private readonly fieldService: CompetitionFieldService,
    private readonly cache: CompetitionControlCache,
    private readonly onDeckRemovedEvent: OnDeckRemovedEvent
  ) { super() }

  protected async getContext (): Promise<OnLiveEventContext> {
    const onDeckField = this.cache.getOnDeckField()

    if (onDeckField === null) throw new BadRequestException('No field is on deck')

    const fieldInfo = await this.fieldService.getCompetitionField(onDeckField)

    if (fieldInfo === null) throw new BadRequestException('Field does not exist')

    const sittingId = fieldInfo.onFieldSittingId

    if (sittingId === null) throw new BadRequestException('Field is not occupied')

    return {
      fieldId: onDeckField,
      sittingId
    }
  }

  protected async doExecute (data: OnLiveEventContext): Promise<OnLiveEventContext> {
    this.logger.log(`Putting field ${data.fieldId} live`)
    await this.onDeckRemovedEvent.execute({})
    this.cache.setLiveField(data.fieldId)
    return data
  }
}
