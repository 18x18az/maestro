import { Injectable, Logger } from '@nestjs/common'
import { CONTROL_MODE, FieldControlService } from '../field-control'
import { SkillsPublisher } from './skills.publisher'

@Injectable()
export class SkillsService {
  private readonly logger: Logger = new Logger(SkillsService.name)

  constructor (
    private readonly control: FieldControlService,
    private readonly publisher: SkillsPublisher
  ) {}

  private async queueSkillsMatch (fieldId: number, type: CONTROL_MODE): Promise<void> {
    await this.control.load(fieldId, type, 60 * 1000)
  }

  async queueDriverSkillsMatch (fieldId: number): Promise<void> {
    await this.queueSkillsMatch(fieldId, CONTROL_MODE.DRIVER)
  }

  async queueProgrammingSkillsMatch (fieldId: number): Promise<void> {
    await this.queueSkillsMatch(fieldId, CONTROL_MODE.AUTO)
  }

  async startSkillsMatch (fieldId: number): Promise<void> {
    await this.control.start(fieldId)
    await this.publisher.publishStopTime(fieldId, null)
  }

  async stopSkillsMatch (fieldId: number): Promise<void> {
    const stopTimeMillis = await this.control.stop(fieldId)
    const stopTime = Math.floor((stopTimeMillis / 1000))
    this.logger.log(`Ended skills early with a stop time of ${stopTime}`)
    await this.publisher.publishStopTime(fieldId, stopTime)
  }
}
