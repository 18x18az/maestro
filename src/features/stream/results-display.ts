import { Injectable } from '@nestjs/common'
import { DisplayedResults } from './stream.interface'
import { StreamPublisher } from './stream.publisher'

@Injectable()
export class ResultsDisplayService {
  private stagedResults: DisplayedResults | null = null

  constructor (private readonly publisher: StreamPublisher) {}

  setStagedResults (results: DisplayedResults): void {
    this.stagedResults = results
  }

  async publishStagedResults (): Promise<void> {
    await this.publisher.publishStagedResults(this.stagedResults)
    this.stagedResults = null
  }

  async clearResults (): Promise<void> {
    await this.publisher.publishStagedResults(null)
  }
}
