import { Injectable, Logger } from '@nestjs/common'
import { FieldService } from '../field'
import { ObsService } from './obs.service'
import { StreamDisplayStage } from './stream.interface'
import { StreamPublisher } from './stream.publisher'
import { CameraService } from './camera.service'

@Injectable()
export class FieldDisplayService {
  private readonly logger: Logger = new Logger(FieldDisplayService.name)

  private previewedStage = StreamDisplayStage.UNKNOWN

  constructor (
    private readonly fields: FieldService,
    private readonly obs: ObsService,
    private readonly publisher: StreamPublisher,
    private readonly camera: CameraService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
  }

  async previewMatchOnField (fieldId: number): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    const fieldIndex = fields.findIndex(field => field.id === fieldId)
    void this.camera.callPreset(fieldIndex, 0)
    const field = fields[fieldIndex]
    if (field === undefined) {
      throw new Error(`Field ${fieldId} not found`)
    }
    const name = field.name
    this.logger.log(`Setting preview scene to match on ${name}`)
    await this.obs.setPreviewScene(name)
    this.previewedStage = StreamDisplayStage.MATCH
  }

  async manualScene (fieldIndex: number): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    const field = fields[fieldIndex - 1]
    if (field === undefined) {
      throw new Error(`Field ${fieldIndex} not found`)
    }
    const name = field.name
    this.logger.log(`Setting preview scene to manual on ${name}`)
    await this.obs.setPreviewScene(name)
  }

  async manualPosition (fieldIndex: number, preset: number): Promise<void> {
    void this.camera.callPreset(fieldIndex - 1, preset)
    this.logger.log(`Setting preview to manual position ${preset} on field ${fieldIndex}`)
    if (preset === 0) {
      this.previewedStage = StreamDisplayStage.MATCH
    } else {
      this.previewedStage = StreamDisplayStage.RESULTS
    }
  }

  async readyScore (currentFieldId: number): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    // get the index of the current field
    const currentFieldIndex = fields.findIndex(field => field.id === currentFieldId)
    // get the index of the previous field, or the last field if there is no previous field
    const previousFieldIndex = currentFieldIndex === 0 ? fields.length - 1 : currentFieldIndex - 1
    void this.camera.callPreset(previousFieldIndex, 1)
    const previousField = fields[previousFieldIndex]
    const previousFieldName = previousField.name
    this.logger.log(`Setting preview to results on ${previousFieldName}`)
    await this.obs.setPreviewScene(previousFieldName)
    this.previewedStage = StreamDisplayStage.RESULTS
  }

  async cut (): Promise<void> {
    const targetScene = this.previewedStage
    this.logger.log('Cutting to preview')
    await this.obs.triggerTransition()
    await this.publisher.publishDisplayStage(StreamDisplayStage.TRANSITIONING)
    this.previewedStage = StreamDisplayStage.UNKNOWN
    setTimeout(() => {
      void this.publisher.publishDisplayStage(targetScene)
    }, 2000)
  }
}
