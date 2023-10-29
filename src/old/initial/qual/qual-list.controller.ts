import { Body, Controller, Post } from '@nestjs/common'
import { QualScheduleService } from './qual-list.service'
import { EventPattern } from '@nestjs/microservices'
import { QualUpload } from './qual-list.interface'
import { EVENT_STAGE_KEY, EventStage } from '@/old/stage'
import { QueuedMatch } from '@/old/competition'
import { FieldInfoBroadcast } from '@/old/devices/field'

@Controller('quals')
export class QualListController {
  constructor (private readonly qualScheduleService: QualScheduleService) { }

  @EventPattern(EVENT_STAGE_KEY)
  async handleStageChange (info: EventStage): Promise<void> {
    await this.qualScheduleService.handleStageChange(info.stage)
  }

  @EventPattern('fields')
  async handleGetFields (fields: FieldInfoBroadcast[]): Promise<void> {
    await this.qualScheduleService.handleGetFields(fields)
  }

  @EventPattern('queuedMatches')
  async handleQueueingUpdate (queued: QueuedMatch[]): Promise<void> {
    await this.qualScheduleService.handleQueueingUpdate(queued)
  }

  @Post('')
  async uploadQualSchedule (@Body() schedule: QualUpload): Promise<void> {
    await this.qualScheduleService.uploadQualSchedule(schedule)
  }
}
