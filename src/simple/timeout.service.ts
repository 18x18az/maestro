import { Injectable, Logger } from '@nestjs/common'
import { SimplePublisher } from './simple.publisher'

@Injectable()
export class TimeoutService {
  private readonly logger = new Logger(TimeoutService.name)

  private pendingTimeout: NodeJS.Timeout | null = null

  constructor (private readonly publisher: SimplePublisher) {}

  private async endTimeout (): Promise<void> {
    this.logger.log('timeout ended')
    await this.publisher.publishTimeout(null)
    this.pendingTimeout = null
  }

  async callTimeout (): Promise<void> {
    if (this.pendingTimeout === null) {
      const endTime = new Date(Date.now() + 1000 * 60 * 3)
      await this.publisher.publishTimeout(endTime)
      const timeRemaining = endTime.getTime() - Date.now()
      this.logger.log('timeout called')
      this.pendingTimeout = setTimeout(() => {
        this.logger.log('timeout finished')
        void this.endTimeout()
      }, timeRemaining)
    } else {
      this.logger.log('timeout ended early')
      clearTimeout(this.pendingTimeout)
      await this.endTimeout()
    }
  }
}
