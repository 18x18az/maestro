import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { InspectionService } from './inspection.service'
import { EventPattern } from '@nestjs/microservices'
import { ApiResponse } from '@nestjs/swagger'
import { InspectionChecklist, InspectionSectionSummary, InspectionSummary } from '../../../interfaces/inspection'
import { EVENT_STAGE } from '../../stage/stage.interface'
import { INSPECTION_STAGE } from './inspection.interface'

@Controller('inspection')
export class InspectionController {
  constructor (private readonly inspectionService: InspectionService) {
  }

  @EventPattern('teamList')
  async handleMessage (message: any): Promise<void> {
    await this.inspectionService.loadTeams(message)
  }

  @EventPattern('eventStage')
  handleEventStage (message: EVENT_STAGE): void {
    this.inspectionService.setEventStage(message)
  }

  @Post(':teamNumber/checkedIn')
  async markCheckedIn (@Param() params: any): Promise<void> {
    await this.inspectionService.markCheckinStage(params.teamNumber, INSPECTION_STAGE.CHECKED_IN)
  }

  @Post(':teamNumber/notHere')
  async markNotHere (@Param() params: any): Promise<void> {
    await this.inspectionService.markCheckinStage(params.teamNumber, INSPECTION_STAGE.NOT_HERE)
  }

  @Post(':teamNumber/noShow')
  async markNoShow (@Param() params: any): Promise<void> {
    await this.inspectionService.markCheckinStage(params.teamNumber, INSPECTION_STAGE.NO_SHOW)
  }

  @Post(':teamNumber/criteria/:criteriaId')
  async markMetOrNot (@Param() params: any, @Query() query: any): Promise<void> {
    await this.inspectionService.markMetOrNot(params.teamNumber, parseInt(params.criteriaId), query.isMet === 'true')
  }

  @Get('checklist')
  async getChecklist (): Promise<InspectionChecklist> {
    return await this.inspectionService.getChecklist()
  }

  @Get(':teamNumber')
  @ApiResponse({ status: 200, description: 'Returns the inspection summary for the team', type: InspectionSectionSummary, isArray: true })
  async getTeamProgress (@Param() params: any): Promise<InspectionSummary> {
    return await this.inspectionService.getTeamProgress(params.teamNumber)
  }
}
