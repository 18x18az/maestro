import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Timeout } from './timeout.object'

@Injectable()
export class TimeoutService {
  private endTime: Date | null = null
  private timer: NodeJS.Timeout | null = null

  private readonly logger = new Logger(TimeoutService.name)

  getTimeout (): Timeout {
    return {
      endTime: this.endTime
    }
  }

  startTimeout (): void {
    if (this.timer !== null) throw new BadRequestException('A timeout is already running')
    this.logger.log('Starting timeout')
    const duration = 3 * 60 * 1000
    this.endTime = new Date(Date.now() + duration)
    this.timer = setTimeout(() => {
      this.endTime = null
      this.timer = null
      this.logger.log('Timeout ended')
    }, duration)
  }

  cancelTimeout (): void {
    this.logger.log('Cancelling timeout')
    if (this.timer === null) throw new BadRequestException('No timeout is currently running')

    clearTimeout(this.timer)
    this.endTime = null
    this.timer = null
  }
}
