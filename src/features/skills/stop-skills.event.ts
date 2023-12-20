import { EventService } from '../../utils/classes/event-service'
import { StopFieldResult } from '../field-control/stop-field.event'

export class StopSkillsEvent extends EventService<StopFieldResult, StopFieldResult, StopFieldResult> {
  protected async doExecute (data: StopFieldResult): Promise<StopFieldResult> {
    this.logger.log(`Ended skills early with a stop time of ${data.stopTime}`)
    return data
  }
}
