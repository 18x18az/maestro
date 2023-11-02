import { Injectable, Logger } from '@nestjs/common'
import { FieldService } from '../field'
import { ObsService } from './obs.service'
import { StreamDisplayStage } from './stream.interface'
import { StreamPublisher } from './stream.publisher'

@Injectable()
export class FieldDisplayService {
  private readonly logger: Logger = new Logger(FieldDisplayService.name)

  private previewedStage = StreamDisplayStage.UNKNOWN

  constructor (
    private readonly fields: FieldService,
    private readonly obs: ObsService,
    private readonly publisher: StreamPublisher
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
  }

  async previewMatchOnField (fieldId: number): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    const field = fields.find(field => field.id === fieldId)
    if (field === undefined) {
      throw new Error(`Field ${fieldId} not found`)
    }
    const name = field.name
    this.logger.log(`Setting preview scene to match on ${name}`)
    await this.obs.setPreviewScene(name)
    this.previewedStage = StreamDisplayStage.MATCH
  }

  async readyScore (currentFieldId: number): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    // get the index of the current field
    const currentFieldIndex = fields.findIndex(field => field.id === currentFieldId)
    // get the index of the previous field, or the last field if there is no previous field
    const previousFieldIndex = currentFieldIndex === 0 ? fields.length - 1 : currentFieldIndex - 1
    const previousField = fields[previousFieldIndex]
    const previousFieldName = previousField.name
    this.logger.log(`Setting preview to results on ${previousFieldName}`)
    await this.obs.setPreviewScene(previousFieldName)
    this.previewedStage = StreamDisplayStage.RESULTS
  }

  async cut (): Promise<void> {
    this.logger.log('Cutting to preview')
    await this.obs.triggerTransition()
    await this.publisher.publishDisplayStage(StreamDisplayStage.TRANSITIONING)
    setTimeout(() => {
      this.logger.log(this.previewedStage)
      void this.publisher.publishDisplayStage(this.previewedStage)
      this.previewedStage = StreamDisplayStage.UNKNOWN
    }, 2000)
  }
}
