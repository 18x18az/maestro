import { Injectable } from '@nestjs/common'
import { StreamPublisher } from './stream.publisher'

@Injectable()
export class ResultsDisplayService {
  constructor (private readonly publisher: StreamPublisher) {}

  async publishStagedResults (): Promise<void> {
    // const results = this.control.getResults()
    // await this.publisher.publishStagedResults(results)
  }

  async clearResults (): Promise<void> {
    // this.control.clearResults()
    // await this.publisher.publishStagedResults(null)
  }
}
