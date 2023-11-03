import { Injectable, Logger } from '@nestjs/common'
import { FieldControlPublisher } from './field-control.publisher'

@Injectable()
export class TimeoutService {
  private readonly logger: Logger = new Logger(TimeoutService.name)

  private timer: NodeJS.Timeout | null = null

  constructor (private readonly publisher: FieldControlPublisher) {}

  async callTimeout (): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.logger.log('Timeout cancelled')
      this.timer = null
      await this.publisher.publishTimeout(null)
    } else {
      // 3 minutes
      const timeoutEnd = new Date(Date.now() + 180000)
      await this.publisher.publishTimeout(timeoutEnd.toISOString())
      this.logger.log('Timeout called')
      const msRemaining = timeoutEnd.getTime() - Date.now()
      this.timer = setTimeout(() => {
        this.logger.log('Timeout expired')
        this.timer = null
        void this.publisher.publishTimeout(null)
      }, msRemaining)
    }
  }
}
