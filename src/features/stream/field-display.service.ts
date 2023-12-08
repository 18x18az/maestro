import { Injectable, Logger } from '@nestjs/common'
import { StreamDisplayStage } from './stream.interface'
import { StreamPublisher } from './stream.publisher'
import { ResultsDisplayService } from './results-display'
import { SceneService } from './scene.service'

const FIELD_NAMES = ['Field 1', 'Field 2', 'Field 3']

@Injectable()
export class FieldDisplayService {
  private readonly logger: Logger = new Logger(FieldDisplayService.name)

  private currentField: number | null = null
  private onDeckField: number | null = null

  constructor (
    private readonly publisher: StreamPublisher,
    private readonly scene: SceneService,
    private readonly results: ResultsDisplayService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
  }

  async updateLiveField (fieldId: number | null): Promise<void> {
    const current = this.currentField
    this.currentField = fieldId
    const remainsNull = fieldId === null && current === null

    if (remainsNull) return

    const remainsNotNull = fieldId !== null && current !== null
    const remainsSameField = remainsNotNull && fieldId === current

    if (remainsSameField) return

    if (fieldId === null) { // No longer an active field, go to results
      await this.results.publishStagedResults()
      this.logger.log('Match ended, setting display stage to results')
      await this.scene.transition()
      await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
      if (this.onDeckField !== null) {
        const onDeckName = FIELD_NAMES[this.onDeckField]
        this.logger.log(`Previewing next match on ${onDeckName}`)
        await this.scene.setPreviewScene(onDeckName, 0)
      }
    } else { // New active field, transition to it
      this.logger.log(`Introing match on ${fieldId}`)
      await this.scene.transition()
      await this.publisher.publishDisplayStage(StreamDisplayStage.MATCH)
      const liveFieldName = FIELD_NAMES[fieldId]
      const onDeckFieldName = FIELD_NAMES[fieldId]
      const unusedScene = FIELD_NAMES.filter(name => name !== liveFieldName && name !== onDeckFieldName)[0]
      this.logger.log(`Previewing results on ${unusedScene}`)
      await this.scene.setPreviewScene(unusedScene, 1)
    }
  }

  async updateOnDeckField (fieldId: number | null): Promise<void> {
    this.onDeckField = fieldId
    if (fieldId === null) return
    this.logger.log(`Next match is on ${fieldId}`)
    if (this.currentField === null) {
      const fieldName = FIELD_NAMES[fieldId]
      this.logger.log(`Previewing next match on ${fieldName}`)
      await this.scene.setPreviewScene(fieldName, 0)
    } else {
      const liveFieldName = FIELD_NAMES[fieldId]
      const onDeckFieldName = FIELD_NAMES[fieldId]
      const unusedScene = FIELD_NAMES.filter(name => name !== liveFieldName && name !== onDeckFieldName)[0]
      this.logger.log(`Previewing results on ${unusedScene}`)
      await this.scene.setPreviewScene(unusedScene, 1)
    }
  }
}
