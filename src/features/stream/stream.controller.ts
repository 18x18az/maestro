import { Body, Controller, Post } from '@nestjs/common'
import { FieldDisplayService } from './field-display.service'
import { ResultsDisplayService } from './results-display'
import { EventPattern } from '@nestjs/microservices'
import { SceneService } from './scene.service'

interface FieldSelection {
  fieldId: number | null
}
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

  @EventPattern('liveField')
  async onActiveFieldChange (selection: FieldSelection): Promise<void> {
    await this.service.updateLiveField(selection.fieldId)
  }

  @EventPattern('onDeckField')
  async onNextFieldChange (selection: FieldSelection): Promise<void> {
    await this.service.updateOnDeckField(selection.fieldId)
  }

  @EventPattern('activeScene')
  async onActiveSceneChange (body: { scene: string }): Promise<void> {
    await this.scene.onActiveSceneChange(body.scene)
  }

  @EventPattern('previewScene')
  async onPreviewSceneChange (body: { scene: string }): Promise<void> {
    this.scene.onPreviewSceneChange(body.scene)
  }
}
