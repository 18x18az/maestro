import { Injectable, Logger } from '@nestjs/common'
import { CONTROL_MODE } from '../field-control'
import { SkillsPublisher } from './skills.publisher'
import { StartFieldEvent } from '../field-control/start-field.event'
import { LoadFieldEvent } from '../field-control/load-field.event'
import { StopFieldEvent, StopFieldResult } from '../field-control/stop-field.event'
import { StopSkillsEvent } from './stop-skills.event'

interface SkillsMatch {
  fieldId: number
  type: CONTROL_MODE
}
@Injectable()
export class SkillsService {
  private readonly logger: Logger = new Logger(SkillsService.name)

  private readonly skillsMatches: SkillsMatch[] = []

  constructor (
    private readonly publisher: SkillsPublisher,
    private readonly startField: StartFieldEvent,
    private readonly stopField: StopFieldEvent,
    private readonly loadField: LoadFieldEvent,
    private readonly stopSkillsEvent: StopSkillsEvent
  ) {}

  onApplicationInit (): void {
    this.stopField.registerAfter(this.handleFieldControlStop.bind(this))
  }

  async handleFieldControlStop (data: StopFieldResult): Promise<void> {
    const match = this.skillsMatches.find(m => m.fieldId === data.fieldId)

    if (match === undefined) return

    await this.stopSkillsEvent.execute(data)
    this.skillsMatches.splice(this.skillsMatches.indexOf(match), 1)
  }

  private async queueSkillsMatch (fieldId: number, type: CONTROL_MODE): Promise<void> {
    const match = this.skillsMatches.find(m => m.fieldId === fieldId)
    if (match !== undefined) {
      match.type = type
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
    await this.startField.execute({ fieldId })
    await this.publisher.publishStopTime(fieldId, null)
  }
}
