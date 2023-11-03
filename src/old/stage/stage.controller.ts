// import { Controller, Post } from '@nestjs/common'
// import { EventPattern } from '@nestjs/microservices'
// import { StageService } from './stage.service'
// import { QUAL_MATCH_LIST_CHANNEL } from '../initial'
// import { EVENT_STAGE } from './stage.interface'

// @Controller('stage')
// export class StageController {
//   constructor (private readonly stageService: StageService) { }

//   @EventPattern('teamList')
//   async handleGotTeams (): Promise<void> {
//     await this.stageService.receivedTeams()
//   }

//   @EventPattern(QUAL_MATCH_LIST_CHANNEL)
//   async handleGotQuals (): Promise<void> {
//     await this.stageService.receivedQuals()
//   }

//   @Post('reset')
//   async resetStage (): Promise<void> {
//     await this.stageService.setStage(EVENT_STAGE.SETUP)
//   }
// }
