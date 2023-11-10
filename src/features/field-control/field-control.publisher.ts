import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { AutomationState, FieldStatus } from './field-control.interface'

const FIELD_STATUSES_TOPIC = 'fieldStatuses'
const FIELD_STATUS_TOPIC = 'fieldStatus'

@Injectable()
export class FieldControlPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishFieldStatuses (states: FieldStatus[]): Promise<void> {
    await this.publisher.broadcast(FIELD_STATUSES_TOPIC, states)
  }

  async publishFieldStatus (state: FieldStatus): Promise<void> {
    await this.publisher.broadcast(`${FIELD_STATUS_TOPIC}/${state.field.id}`, state)
    console.log(state)
  }

  async publishActiveField (status: FieldStatus | null): Promise<void> {
    await this.publisher.broadcast('activeField', status)
  }

  async publishNextField (status: FieldStatus | null): Promise<void> {
    await this.publisher.broadcast('nextField', status)
  }

  async publishTimeout (time: string | null): Promise<void> {
    await this.publisher.broadcast('timeout', { time })
  }

  async publishAutomationState (state: AutomationState): Promise<void> {
    await this.publisher.broadcast('automation', { state })
  }
}
