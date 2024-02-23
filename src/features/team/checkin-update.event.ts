import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { Inspection } from './team.interface'
import { CheckinService } from './checkin.service'
import { TeamEntity } from './team.entity'

export interface CheckinUpdatePayload {
  team: number
  status: Inspection
}

export interface CheckinUpdateResult extends CheckinUpdatePayload {
  teamEntity: TeamEntity
}

@Injectable()
export class CheckinUpdateEvent extends EventService<CheckinUpdatePayload, CheckinUpdatePayload, CheckinUpdateResult> {
  constructor (private readonly service: CheckinService) { super() }

  protected async doExecute (data: CheckinUpdatePayload): Promise<CheckinUpdateResult> {
    const entity = await this.service.markCheckinStatus(data.team, data.status)
    return {
      teamEntity: entity,
      ...data
    }
  }
}
