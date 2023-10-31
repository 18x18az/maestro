import { Injectable, Logger } from '@nestjs/common'
import { EventStage } from '../stage'
import { FieldStatus, FieldState } from './field-control.interface'
import { FieldService } from '../field/field.service'
import { FieldControlPublisher } from './field-control.publisher'

@Injectable()
export class FieldControlInternal {
  private readonly logger: Logger = new Logger(FieldControlInternal.name)

  private fields: FieldStatus[] = []
  private readonly currentField: FieldStatus | null = null

  constructor (
    private readonly fieldInfo: FieldService,
    private readonly publisher: FieldControlPublisher
  ) {}

  async handleStage (stage: EventStage): Promise<void> {
    if (stage === EventStage.QUALIFICATIONS) {
      const fields = await this.fieldInfo.getCompetitionFields()

      this.fields = fields.map(field => ({
        field,
        state: FieldState.IDLE,
        match: null
      }))

      await this.updateAllFields()
    }
  }

  async updateAllFields (): Promise<void> {
    for (const field of this.fields) {
      await this.publisher.publishFieldStatus(field)
    }
    await this.publisher.publishFieldStatuses(this.fields)
    await this.publisher.publishFieldControl(this.currentField)
  }
}
