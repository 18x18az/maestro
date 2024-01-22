import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { CompetitionControlCache } from './competition.cache'

interface LiveRemovedEventContext {
  fieldId: number
  sittingId: number
}

@Injectable()
export class LiveRemovedEvent extends EventService<{}, LiveRemovedEventContext, LiveRemovedEventContext> {
  constructor (
    private readonly fieldService: CompetitionFieldService,
    private readonly cache: CompetitionControlCache
  ) { super() }

  protected async getContext (): Promise<LiveRemovedEventContext> {
    const liveField = this.cache.getLiveField()

    if (liveField === null) throw new BadRequestException('No field is live')

    const fieldInfo = await this.fieldService.getCompetitionField(liveField)

    if (fieldInfo === null) throw new BadRequestException('Field does not exist')

    const sittingId = fieldInfo.onFieldSittingId

    if (sittingId === null) throw new BadRequestException('Field is not occupied')

    return {
      fieldId: liveField,
      sittingId
    }
  }

  protected async doExecute (data: LiveRemovedEventContext): Promise<LiveRemovedEventContext> {
    this.logger.log(`Removing field ${data.fieldId} from live`)
    this.cache.setLiveField(null)
    return data
  }
}
