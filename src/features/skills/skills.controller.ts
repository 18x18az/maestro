import { Controller, Param, Post } from '@nestjs/common'
import { SkillsService } from './skills.service'
import { CONTROL_MODE } from '../field-control'

@Controller('skills')
export class SkillsController {
  constructor (private readonly service: SkillsService) {}

  @Post(':fieldId/queue/:type')
  async handleQueueSkills (@Param('fieldId') fieldId: number, @Param('type') type: CONTROL_MODE): Promise<void> {
    if (type === CONTROL_MODE.AUTO) {
      await this.service.queueProgrammingSkillsMatch(fieldId)
    } else {
      await this.service.queueDriverSkillsMatch(fieldId)
    }
  }

  @Post(':fieldId/start')
  async startSkillsMatch (@Param('fieldId') fieldId: number): Promise<void> {
    await this.service.startSkillsMatch(fieldId)
  }

  @Post(':fieldId/stop')
  async stopSkillsMatch (@Param('fieldId') fieldId: number): Promise<void> {
    await this.service.stopSkillsMatch(fieldId)
  }
}
