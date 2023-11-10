import { Body, Controller, Post } from '@nestjs/common'
import { FieldDisplayService } from './field-display.service'
import { ResultsDisplayService } from './results-display'
import { EventPattern } from '@nestjs/microservices'
import { FieldStatus } from '../field-control'
import { Field } from '../field'

@Controller('stream')
export class StreamController {
  constructor (
    private readonly service: FieldDisplayService,
    private readonly results: ResultsDisplayService
  ) {}

  @Post('ready')
  async readyScene (@Body() body: { field: number }): Promise<void> {
    await this.service.manualScene(body.field)
  }

  @Post('preset')
  async readyPreset (@Body() body: { field: number, preset: number }): Promise<void> {
    await this.service.manualPosition(body.field, body.preset)
  }

  @Post('clearScore')
  async clearScore (): Promise<void> {
    await this.results.clearResults()
  }

  @Post('pushScore')
  async pushScore (@Body() body: { field: number }): Promise<void> {
    await this.results.publishStagedResults()
  }

  @EventPattern('activeField')
  async onActiveFieldChange (field: FieldStatus | null): Promise<void> {
    await this.service.updateActiveField(field)
  }

  @EventPattern('nextField')
  async onNextFieldChange (field: FieldStatus | null): Promise<void> {
    await this.service.updateNextField(field)
  }

  @EventPattern('activeScene')
  async onActiveSceneChange (body: { scene: string }): Promise<void> {
    await this.service.updateActiveScene(body.scene)
  }

  @EventPattern('previewScene')
  async onPreviewSceneChange (body: { scene: string }): Promise<void> {
    await this.service.updatePreviewScene(body.scene)
  }

  @EventPattern('fields')
  async onFieldsChange (fields: Field[]): Promise<void> {
    await this.service.updateFields(fields)
  }
}
