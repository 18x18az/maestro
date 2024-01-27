import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { FieldControlModel } from './field-control.model'
import { FieldService } from '../field/field.service'
import { EnableFieldContext, EnableFieldEvent } from '../field/enable-field.event'
import { DisableFieldEvent } from '../field/disable-field.event'
@Injectable()
export class FieldControlService {
  private readonly fields: Map<number, FieldControlModel> = new Map<number, FieldControlModel>()

  private readonly logger = new Logger(FieldControlService.name)

  constructor (
    private readonly fieldInfo: FieldService,
    private readonly enableFieldEvent: EnableFieldEvent,
    private readonly disableFieldEvent: DisableFieldEvent
  ) { }

  async getOrCreateField (fieldId: number): Promise<FieldControlModel> {
    if (!(await this.fieldInfo.isEnabled(fieldId))) {
      this.logger.warn(`Attempted to control disabled field ${fieldId}`)
      throw new BadRequestException(`Field ${fieldId} is not enabled`)
    }

    let field = this.fields.get(fieldId)

    if (field === undefined) {
      field = new FieldControlModel(fieldId)
      this.fields.set(fieldId, field)
    }

    return field
  }

  getFieldControl (fieldId: number): FieldControlModel {
    const field = this.fields.get(fieldId)
    if (field === undefined) throw new NotFoundException(`Field control for ${fieldId} not found`)
    return field
  }

  createFieldControl (data: EnableFieldContext): void {
    const { id } = data
    this.logger.log(`Creating field control for field with id ${id}`)
    const field = new FieldControlModel(id)
    this.fields.set(id, field)
  }

  deleteFieldControl (fieldId: number): void {
    this.logger.log(`Deleting field control for field with id ${fieldId}`)
    const existing = this.fields.get(fieldId)

    if (existing === undefined) return

    if (existing.isRunning()) {
      throw new BadRequestException(`Cannot delete field ${fieldId} while it is running`)
    }

    this.fields.delete(fieldId)
  }

  onModuleInit (): void {
    this.enableFieldEvent.registerOnComplete(this.createFieldControl.bind(this))
    this.disableFieldEvent.registerBefore(this.deleteFieldControl.bind(this))
  }

  public getFieldControls (): FieldControlModel[] {
    return Array.from(this.fields.values())
  }
}
