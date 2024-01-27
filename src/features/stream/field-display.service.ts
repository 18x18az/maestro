import { Injectable, Logger } from '@nestjs/common'
import { FieldEntity as Field } from '../field/field.entity'

// const FIELD_NAMES = ['Field 1', 'Field 2', 'Field 3']

@Injectable()
export class FieldDisplayService {
  private readonly logger: Logger = new Logger(FieldDisplayService.name)

  private readonly currentField: Field | null = null
  private readonly onDeckField: Field | null = null

  async updateLiveField (fieldId: number | null): Promise<void> {
    // const previousField = this.currentField
    // const newField = fieldId === null ? null : await this.fields.getField(fieldId)
    // this.currentField = newField
    // const remainsNull = previousField === null && newField === null

    // if (remainsNull) return

    // const remainsNotNull = newField !== null && previousField !== null
    // const remainsSameField = remainsNotNull && newField.id === previousField.id

    // if (remainsSameField) return

    // if (newField === null) { // No longer an active field, go to results
    //   await this.results.publishStagedResults()
    //   this.logger.log('Match ended, setting display stage to results')
    //   await this.scene.transition()
    //   await this.publisher.publishDisplayStage(StreamDisplayStage.RESULTS)
    //   if (this.onDeckField !== null) {
    //     const onDeckName = this.onDeckField.name
    //     this.logger.log(`Previewing next match on ${onDeckName}`)
    //     await this.scene.setPreviewScene(onDeckName, 0)
    //   }
    // } else { // New active field, transition to it
    //   this.logger.log(`Introing match on ${newField.name}`)
    //   await this.scene.transition()
    //   await this.publisher.publishDisplayStage(StreamDisplayStage.MATCH)
    //   const index = FIELD_NAMES.indexOf(newField.name)
    //   const unusedIndex = (index + 2) % 3
    //   const unusedScene = FIELD_NAMES[unusedIndex]
    //   this.logger.log(`Previewing results on ${unusedScene}`)
    //   await this.scene.setPreviewScene(unusedScene, 1)
    // }
  }

  async updateOnDeckField (fieldId: number | null): Promise<void> {
    // const onDeckField = fieldId === null ? null : await this.fields.getField(fieldId)
    // this.onDeckField = onDeckField
    // if (onDeckField === null) return
    // this.logger.log(`Next match is on ${onDeckField.name}`)
    // if (this.currentField === null) {
    //   this.logger.log(`Previewing next match on ${onDeckField.name}`)
    //   await this.scene.setPreviewScene(onDeckField.name, 0)
    // } else {
    //   const index = FIELD_NAMES.indexOf(this.currentField.name)
    //   const unusedIndex = (index + 2) % 3
    //   const unusedScene = FIELD_NAMES[unusedIndex]
    //   this.logger.log(`Previewing results on ${unusedScene}`)
    //   await this.scene.setPreviewScene(unusedScene, 1)
    // }
  }
}
