import { Injectable } from '@nestjs/common'
import { FieldStatus } from './simple.interface'

@Injectable()
export class TimerService {
  private currentTimeout: NodeJS.Timeout | null = null

  startTimer (callback: () => void, match: FieldStatus): void {
    const endTime = match.time

    if (endTime === undefined) return

    const end = new Date(endTime)

    const timeout = end.getTime() - Date.now()
    this.currentTimeout = setTimeout(callback, timeout)
  }

  stopTimer (): void {
    if (this.currentTimeout != null) {
      clearTimeout(this.currentTimeout)
      this.currentTimeout = null
    }
  }
}
