import { Injectable, Logger } from '@nestjs/common'
import { StreamDisplayStage } from './stream.interface'
import { StreamPublisher } from './stream.publisher'
import { ResultsDisplayService } from './results-display'
import { SceneService } from './scene.service'

// const FIELD_NAMES = ['Field 1', 'Field 2', 'Field 3']

@Injectable()
export class FieldDisplayService {
  private readonly logger: Logger = new Logger(FieldDisplayService.name)

  // private currentField: FieldStatus | null = null
  // private nextField: FieldStatus | null = null

  constructor (
    private readonly publisher: StreamPublisher,
    private readonly scene: SceneService,
    private readonly results: ResultsDisplayService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
  }

  // async updateActiveField (status: FieldStatus | null): Promise<void> {
  //   // const current = this.currentField
  //   // this.currentField = status
  //   // const remainsNull = status === null && current === null

  //   // if (remainsNull) return

  //   // const remainsNotNull = status !== null && current !== null
  //   // const remainsSameField = remainsNotNull && status.field.id === current.field.id

  //   // if (remainsSameField) return

  //   if (status === null) { // No longer an active field, go to results
  //     await this.results.publishStagedResults()
  //     this.logger.log('Match ended, setting display stage to results')
  //     await this.scene.transition()
  //     await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
  //     // if (this.nextField !== null) {
  //     //   this.logger.log(`Previewing next match on ${this.nextField.field.name}`)
  //     //   await this.scene.setPreviewScene(this.nextField.field.name, 0)
  //     // }
  //   } else { // New active field, transition to it
  //     // this.logger.log(`Introing match on ${status.field.name}`)
  //     await this.scene.transition()
  //     await this.publisher.publishDisplayStage(StreamDisplayStage.MATCH)
  //     // const unusedScene = FIELD_NAMES.filter(name => name !== status.field.name && name !== this.nextField?.field.name)[0]
  //     // this.logger.log(`Previewing results on ${unusedScene}`)
  //     // await this.scene.setPreviewScene(unusedScene, 1)
  //   }
  // }

  // async updateNextField (status: FieldStatus | null): Promise<void> {
  //   this.nextField = status
  //   if (status === null) return
  //   this.logger.log(`Next match is on ${status.field.name}`)
  //   if (this.currentField === null) {
  //     this.logger.log(`Previewing next match on ${status.field.name}`)
  //     await this.scene.setPreviewScene(status.field.name, 0)
  //   } else {
  //     const unusedScene = FIELD_NAMES.filter(name => name !== this.currentField?.field.name && name !== status.field.name)[0]
  //     this.logger.log(`Previewing results on ${unusedScene}`)
  //     await this.scene.setPreviewScene(unusedScene, 1)
  //   }
  // }
}
