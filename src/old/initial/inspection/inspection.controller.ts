// import { Body, Controller, Get, Param, Post } from '@nestjs/common'
// import { InspectionService } from './inspection.service'
// import { EventPattern } from '@nestjs/microservices'
// import { ApiResponse } from '@nestjs/swagger'
// import { InspectionChecklist, InspectionSectionSummary } from '../../../interfaces/inspection'
// import { EVENT_STAGE_KEY, EventStage } from '../../stage'
// import { INSPECTION_STAGE, InspectionSectionDataBroadcast } from './inspection.interface'

// @Controller('inspection')
// export class InspectionController {
//   constructor (private readonly inspectionService: InspectionService) {
//   }

//   @EventPattern('teamList')
//   async handleMessage (message: any): Promise<void> {
//     await this.inspectionService.loadTeams(message)
//   }

//   @EventPattern(EVENT_STAGE_KEY)
//   async handleEventStage (message: EventStage): Promise<void> {
//     await this.inspectionService.setEventStage(message.stage)
//   }

//   @Post(':teamNumber/checkedIn')
//   async markCheckedIn (@Param() params: any): Promise<void> {
//     await this.inspectionService.markCheckinStage(params.teamNumber, INSPECTION_STAGE.CHECKED_IN)
//   }

//   @Post(':teamNumber/notHere')
//   async markNotHere (@Param() params: any): Promise<void> {
//     await this.inspectionService.markCheckinStage(params.teamNumber, INSPECTION_STAGE.NOT_HERE)
//   }

//   @Post(':teamNumber/noShow')
//   async markNoShow (@Param() params: any): Promise<void> {
//     await this.inspectionService.markCheckinStage(params.teamNumber, INSPECTION_STAGE.NO_SHOW)
//   }

//   @Post(':teamNumber/criteria/:criteriaId')
//   async markMetOrNot (@Param() params: any, @Body() body: { met: boolean }): Promise<void> {
//     await this.inspectionService.markMetOrNot(params.teamNumber, parseInt(params.criteriaId), body.met)
//   }

//   @Get('checklist')
//   async getChecklist (): Promise<InspectionChecklist> {
//     return await this.inspectionService.getChecklist()
//   }

//   @Get(':teamNumber')
//   @ApiResponse({ status: 200, description: 'Returns the inspection summary for the team', type: InspectionSectionSummary, isArray: true })
//   async getTeamProgress (@Param() params: any): Promise<InspectionSectionDataBroadcast[]> {
//     return await this.inspectionService.getTeamProgress(params.teamNumber)
//   }
// }
