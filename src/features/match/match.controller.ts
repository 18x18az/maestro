import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { QualService } from './qual.service'
import { MatchInternal } from './match.internal'
import { EventPattern } from '@nestjs/microservices'
import { EventStage, STAGE_TOPIC } from '../stage'
import { MatchIdentifier } from './match.interface'

@Controller('matches')
export class MatchController {
  constructor (
    private readonly quals: QualService,
    private readonly service: MatchInternal
  ) {}

  @Post('quals')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMatches (@UploadedFile() file: Express.Multer.File): Promise<void> {
    const data = file.buffer.toString()
    await this.quals.handleUpload(data)
  }

  @EventPattern(STAGE_TOPIC)
  async handleStage (stage: { stage: EventStage }): Promise<void> {
    await this.service.handleStageChange(stage.stage)
  }

  @Post('replay')
  async replayMatch (@Body() match: MatchIdentifier): Promise<void> {
    await this.service.replayMatch(match)
  }
}
