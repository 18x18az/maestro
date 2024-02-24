import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { Inspection } from '../team/team.interface'
import { InspectionService } from './inspection.service'

export interface InspectionUpdatePayload {
  teamId: number
  pointId: number
  isMet: boolean
}

export interface InspectionUpdateContext extends InspectionUpdatePayload {
  initial: Inspection
}

export interface InspectionUpdateResult extends InspectionUpdateContext {
  updated: Inspection
}

@Injectable()
export class InspectionUpdateEvent extends EventService<InspectionUpdatePayload, InspectionUpdateContext, InspectionUpdateResult> {
  constructor (
    private readonly service: InspectionService
  ) { super() }

  protected async getContext (data: InspectionUpdatePayload): Promise<InspectionUpdateContext> {
    const initial = this.service.getInspectionSummary(data.teamId)

    return { ...data, initial }
  }

  protected async doExecute (data: InspectionUpdateContext): Promise<InspectionUpdateResult> {
    await this.service.setTeamInspectionPoint(data.teamId, data.pointId, data.isMet)
    const updated = this.service.getInspectionSummary(data.teamId)
    return { ...data, updated }
  }
}
