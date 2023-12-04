import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldControlModel } from './field-control.model'
import { CONTROL_MODE, FieldControlEndCb } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'
import { FieldService } from '../field/field.service'
@Injectable()
export class FieldControlService {
  private readonly fields: Map<number, FieldControlModel> = new Map<number, FieldControlModel>()

  private readonly logger = new Logger(FieldControlService.name)

  constructor (private readonly publisher: FieldControlPublisher, private readonly fieldInfo: FieldService) { }
  private async getOrCreateField (fieldId: number): Promise<FieldControlModel> {
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

  public async load (fieldId: number, mode: CONTROL_MODE, duration: number): Promise<void> {
    const field = await this.getOrCreateField(fieldId)
    await field.load(mode, duration)
  }

  public async start (fieldId: number, endCb?: FieldControlEndCb): Promise<void> {
    const field = await this.getOrCreateField(fieldId)
    await field.start(endCb)
  }

  public async stop (fieldId: number): Promise<number> {
    const field = await this.getOrCreateField(fieldId)
    return await field.stop()
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
