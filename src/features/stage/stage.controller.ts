import { Controller } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { StageService } from './stage.service'
import { QUAL_MATCH_LIST_CHANNEL } from '../initial'

@Controller('stage')
export class StageController {
  constructor (private readonly stageService: StageService) { }

  @EventPattern('teamList')
  async handleGotTeams (): Promise<void> {
    await this.stageService.receivedTeams()
  }

  @EventPattern(QUAL_MATCH_LIST_CHANNEL)
  async handleGotQuals (): Promise<void> {
    await this.stageService.receivedQuals()
  }
}
