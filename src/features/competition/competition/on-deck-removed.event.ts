import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { CompetitionControlCache } from './competition.cache'

interface OnDeckRemovedEventContext {
  fieldId: number
  sittingId: number
}

@Injectable()
export class OnDeckRemovedEvent extends EventService<{}, OnDeckRemovedEventContext, OnDeckRemovedEventContext> {
  constructor (
    private readonly fieldService: CompetitionFieldService,
    private readonly cache: CompetitionControlCache
  ) { super() }

  protected async getContext (): Promise<OnDeckRemovedEventContext> {
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

  protected async doExecute (data: OnDeckRemovedEventContext): Promise<OnDeckRemovedEventContext> {
    this.logger.log(`Removing field ${data.fieldId} from on deck`)
    this.cache.setOnDeckField(null)
    return data
  }
}
