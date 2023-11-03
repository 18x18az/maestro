import { Body, Controller, Post } from '@nestjs/common'
import { FieldDisplayService } from './field-display.service'
import { ResultsDisplayService } from './results-display'

@Controller('stream')
export class StreamController {
  constructor (
    private readonly service: FieldDisplayService,
    private readonly results: ResultsDisplayService
  ) {}

  @Post('cut')
  async cut (): Promise<void> {
    await this.service.cut()
  }

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
}
