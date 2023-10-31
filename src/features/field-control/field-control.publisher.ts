import { PublishService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { FieldStatus } from './field-control.interface'

const FIELD_STATUSES_TOPIC = 'fieldStatuses'
const FIELD_STATUS_TOPIC = 'fieldStatus'
const FIELD_CONTROL_TOPIC = 'fieldControl'

@Injectable()
export class FieldControlPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishFieldStatuses (states: FieldStatus[]): Promise<void> {
    await this.publisher.broadcast(FIELD_STATUSES_TOPIC, states)
  }

  async publishFieldStatus (state: FieldStatus): Promise<void> {
    await this.publisher.broadcast(`${FIELD_STATUS_TOPIC}/${state.field.id}`, { state })
  }

  async publishFieldControl (state: FieldStatus | null): Promise<void> {
    await this.publisher.broadcast(FIELD_CONTROL_TOPIC, { state })
  }
}
