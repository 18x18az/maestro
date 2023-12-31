import { EventService } from '../classes/event-service'

export class TmConnectedEvent extends EventService<void, void, void> {
  protected async doExecute (): Promise<void> {
    this.logger.log('Connected to TM')
  }
}
