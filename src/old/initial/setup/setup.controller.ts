import { Body, Controller, Logger, Post } from '@nestjs/common'
import { SetupService } from './setup.service'
import { SetupConfig } from './setup.interface'
import { EventPattern } from '@nestjs/microservices'
import { EVENT_STAGE_KEY } from '@/old/stage'

enum STAGE {
  NONE = 'none',
  CODE = 'code',
  DONE = 'done'
}

@Controller('setup')
export class SetupController {
  private readonly logger = new Logger(SetupController.name)
  private readonly stage: STAGE

  constructor (private readonly service: SetupService) {
    this.stage = STAGE.CODE
  }

  @Post('config')
  async submitConfig (@Body() config: SetupConfig): Promise<void> {
    await this.service.initialConfig(config)
  }

  @EventPattern(EVENT_STAGE_KEY)
  async handleStage (): Promise<void> {
    await this.service.handleStageChange()
  }
}
