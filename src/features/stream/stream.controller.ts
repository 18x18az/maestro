import { Body, Controller, Post } from '@nestjs/common'
import { FieldDisplayService } from './field-display.service'
import { ResultsDisplayService } from './results-display'
import { EventPattern } from '@nestjs/microservices'
import { SceneService } from './scene.service'

@Controller('stream')
export class StreamController {
  constructor (
    private readonly service: FieldDisplayService,
    private readonly results: ResultsDisplayService,
    private readonly scene: SceneService
  ) {}

  @Post('clearScore')
  async clearScore (): Promise<void> {
    await this.results.clearResults()
  }

  @Post('pushScore')
  async pushScore (@Body() body: { field: number }): Promise<void> {
    await this.results.publishStagedResults()
  }

  // @EventPattern('activeField')
  // async onActiveFieldChange (field: FieldStatus | null): Promise<void> {
  //   await this.service.updateActiveField(field)
  // }

  // @EventPattern('nextField')
  // async onNextFieldChange (field: FieldStatus | null): Promise<void> {
  //   await this.service.updateNextField(field)
  // }

  @EventPattern('activeScene')
  async onActiveSceneChange (body: { scene: string }): Promise<void> {
    await this.scene.onActiveSceneChange(body.scene)
  }

  @EventPattern('previewScene')
  async onPreviewSceneChange (body: { scene: string }): Promise<void> {
    this.scene.onPreviewSceneChange(body.scene)
  }
}
