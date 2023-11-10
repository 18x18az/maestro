import { Injectable, Logger } from '@nestjs/common'
import { Field, FieldService } from '../field'
import { ObsService } from './obs.service'
import { StreamDisplayStage } from './stream.interface'
import { StreamPublisher } from './stream.publisher'
import { CameraService } from './camera.service'
import { FieldStatus } from '../field-control'
import { ResultsDisplayService } from './results-display'

@Injectable()
export class FieldDisplayService {
  private readonly logger: Logger = new Logger(FieldDisplayService.name)

  private matchField: string | undefined
  private currentField: FieldStatus | null = null
  private nextField: FieldStatus | null = null

  private numFields: number

  constructor (
    private readonly fields: FieldService,
    private readonly obs: ObsService,
    private readonly publisher: StreamPublisher,
    private readonly camera: CameraService,
    private readonly results: ResultsDisplayService
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
  }

  async updateActiveField (status: FieldStatus | null): Promise<void> {
    const remainsNull = status === null && this.currentField === null
    const remainsNotNull = status !== null && this.currentField !== null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remainsSameField = remainsNotNull && status.field.id === this.currentField!.field.id
    if (remainsNull || remainsSameField) {
      return
    }
    this.currentField = status
    if (status !== null) {
      this.matchField = status.field.name
    } else if (this.nextField !== null) {
      this.matchField = this.nextField.field.name
    }
    await this.publisher.publishDisplayStage(StreamDisplayStage.TRANSITIONING)
    await this.obs.triggerTransition()
    if (status !== null || this.nextField === null) {
      await this.obs.setPreviewScene('Field 3')
      await this.camera.callPreset(2, 0)
    } else {
      await this.obs.setPreviewScene(this.nextField.field.name)
    }
  }

  async updateNextField (status: FieldStatus | null): Promise<void> {
    this.nextField = status
    if (status !== null) {
      const fields = await this.fields.getCompetitionFields()
      const fieldIndex = fields.findIndex(field => field.id === status.field.id)
      void this.camera.callPreset(fieldIndex, 0)

      if (this.currentField === null) {
        await this.obs.setPreviewScene(status.field.name)
      }
    }
  }

  async updateActiveScene (scene: string): Promise<void> {
    if (scene === this.matchField) {
      this.logger.log('Setting display stage to match')
      await this.publisher.publishDisplayStage(StreamDisplayStage.MATCH)
    } else {
      this.logger.log('Setting display stage to results')
      await this.results.publishStagedResults()
      await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
    }
  }

  async updatePreviewScene (scene: string): Promise<void> {

  }

  async updateFields (fields: Field[]): Promise<void> {
    this.numFields = fields.length
  }
}
