import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldControlModel } from './field-control.model'
import { CONTROL_MODE } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'
import { FieldService } from '../field'
@Injectable()
export class FieldControlService {
  private readonly fields: Map<number, FieldControlModel> = new Map<number, FieldControlModel>()

  private readonly logger = new Logger(FieldControlService.name)

  constructor (private readonly publisher: FieldControlPublisher, private readonly fieldInfo: FieldService) { }
  async getOrCreateField (fieldId: number): Promise<FieldControlModel> {
    if (!(await this.fieldInfo.isEnabled(fieldId))) {
      this.logger.warn(`Attempted to control disabled field ${fieldId}`)
      throw new BadRequestException(`Field ${fieldId} is not enabled`)
    }

    let field = this.fields.get(fieldId)

    if (field === undefined) {
      field = new FieldControlModel(fieldId, this.publisher.publishFieldControlCreatedEvent.bind(this.publisher))
      this.fields.set(fieldId, field)
    }

    return field
  }

  public async getState (fieldId: number): Promise<CONTROL_MODE | undefined> {
    const field = await this.getOrCreateField(fieldId)
    return field.getState()
  }

  public async isRunning (fieldId: number): Promise<boolean> {
    const field = await this.getOrCreateField(fieldId)
    return field.isRunning()
  }
}
