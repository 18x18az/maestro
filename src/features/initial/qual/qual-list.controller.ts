import { Body, Controller, Post } from '@nestjs/common'
import { QualScheduleService } from './qual-list.service'
import { EventPattern } from '@nestjs/microservices'
import { QualUpload } from './qual-list.interface'

@Controller('quals')
export class QualListController {
  constructor (private readonly qualScheduleService: QualScheduleService) { }

  @EventPattern('inspection/canConclude')
  updateCanConclude (message: boolean): void {
    this.qualScheduleService.updateCanConclude(message)
  }

  @Post('generate')
  async getQualSchedule (): Promise<void> {
    await this.qualScheduleService.generateQualSchedule()
  }

  @Post('')
  async uploadQualSchedule (@Body() schedule: QualUpload): Promise<void> {
    await this.qualScheduleService.uploadQualSchedule(schedule)
  }
}
