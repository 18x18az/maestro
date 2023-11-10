import { Injectable } from '@nestjs/common'
import { StreamPublisher } from './stream.publisher'
import { FieldControlService } from '../field-control'

@Injectable()
export class ResultsDisplayService {
  constructor (private readonly publisher: StreamPublisher,
    private readonly control: FieldControlService) {}

  async publishStagedResults (): Promise<void> {
    const results = this.control.getResults()
    await this.publisher.publishStagedResults(results)
  }

  async clearResults (): Promise<void> {
    this.control.clearResults()
    await this.publisher.publishStagedResults(null)
  }
}
