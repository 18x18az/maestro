import { Controller, Post } from '@nestjs/common'
import { QualScheduleService } from './qual-schedule.service'
import { EventPattern } from '@nestjs/microservices'

@Controller('qualSchedule')
export class QualScheduleController {
  constructor (private readonly qualScheduleService: QualScheduleService) { }

  @EventPattern('inspection/canConclude')
  updateCanConclude (message: boolean): void {
    this.qualScheduleService.updateCanConclude(message)
  }

  @Post('/generate')
  async getQualSchedule (): Promise<void> {
    await this.qualScheduleService.generateQualSchedule()
  }
}
