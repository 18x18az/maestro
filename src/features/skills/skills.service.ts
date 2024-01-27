import { Injectable, Logger } from '@nestjs/common'
import { LoadFieldEvent } from '../field-control/load-field.event'
import { CONTROL_MODE } from '../field-control/field-control.interface'
import { FieldService } from '../field/field.service'
import { StopFieldEvent, StopFieldResult } from '../field-control/stop-field.event'

interface SkillsMatch {
  fieldId: number
  type: CONTROL_MODE
  stopTime?: number
}
@Injectable()
export class SkillsService {
  private readonly logger: Logger = new Logger(SkillsService.name)

  private readonly skillsMatches: SkillsMatch[] = []

  constructor (
    private readonly stopField: StopFieldEvent,
    private readonly loadField: LoadFieldEvent,
    private readonly fieldService: FieldService
  ) {}

  onModuleInit (): void {
    this.stopField.registerOnComplete(this.handleFieldControlStop.bind(this))
  }

  private async queueSkillsMatch (fieldId: number, type: CONTROL_MODE): Promise<void> {
    const match = this.skillsMatches.find(m => m.fieldId === fieldId)
    if (match !== undefined) {
      match.type = type
      match.stopTime = undefined
    } else {
      this.skillsMatches.push({ fieldId, type })
    }

    await this.loadField.execute({ fieldId, mode: type, duration: 60 * 1000 })
  }

  async queueDriverSkillsMatch (fieldId: number): Promise<void> {
    await this.queueSkillsMatch(fieldId, CONTROL_MODE.DRIVER)
  }

  async queueProgrammingSkillsMatch (fieldId: number): Promise<void> {
    await this.queueSkillsMatch(fieldId, CONTROL_MODE.AUTO)
  }

  async startSkillsMatch (fieldId: number): Promise<void> {

  }

  async getSkillsMatch (fieldId: number): Promise<SkillsMatch | undefined> {
    const match = this.skillsMatches.find(m => m.fieldId === fieldId)

    if (match === undefined) return undefined

    const field = await this.fieldService.getField(fieldId)
    if (!field.skillsEnabled) {
      this.skillsMatches.splice(this.skillsMatches.indexOf(match), 1)
      return undefined
    }

    return match
  }

  async handleFieldControlStop (event: StopFieldResult): Promise<void> {
    const match = await this.getSkillsMatch(event.fieldId)

    if (match === undefined) return

    match.stopTime = event.stopTime
    this.logger.log(`Skills match for field ${event.fieldId} stopped at ${event.stopTime}`)
  }
}
