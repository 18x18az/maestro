import { BadRequestException, Logger } from '@nestjs/common'
import { CONTROL_MODE } from './field-control.interface'
import { StopFieldEvent } from './stop-field.event'

export class FieldControlModel {
  private timer: null | NodeJS.Timeout = null
  endTime: Date | null = null
  duration: number | null = null
  mode: CONTROL_MODE | undefined

  private readonly logger: Logger = new Logger(FieldControlModel.name)

  constructor (private readonly fieldId: number) {}

  public async stop (): Promise<number> {
    if (this.timer === null) {
      this.logger.warn(`Attempted to stop field ${this.fieldId} when not running`)
      throw new BadRequestException('Timer not started')
    }
    clearTimeout(this.timer)

    this.logger.log(`Field ${this.fieldId} stopped`)

    this.timer = null
    this.duration = null

    let timeRemaining = 0
    if (this.endTime !== null) {
      timeRemaining = this.endTime.getTime() - Date.now()
      this.endTime = null

      if (timeRemaining < 0) {
        timeRemaining = 0
      }
    } else {
      this.logger.warn(`Field ${this.fieldId} end time was null`)
    }

    this.logger.log(`Field ${this.fieldId} stopped with ${timeRemaining}ms remaining`)
    return timeRemaining
  }

  public isRunning (): boolean {
    return this.timer !== null
  }

  public getMode (): CONTROL_MODE | undefined {
    return this.mode
  }

  public async load (mode: CONTROL_MODE, duration: number): Promise<void> {
    if (this.timer !== null) {
      this.logger.warn(`Attempted to load field ${this.fieldId} when already running`)
      throw new BadRequestException('Timer already started')
    }

    this.logger.log(`Loading ${mode} timer for ${duration}ms on field ${this.fieldId}`)

    this.mode = mode
    this.duration = duration
  }

  public start (stopEvent: StopFieldEvent): void {
    if (this.timer !== null) {
      this.logger.warn(`Attempted to start field ${this.fieldId} when already running`)
      throw new BadRequestException('Timer already started')
    }

    if (this.duration === null) {
      this.logger.warn(`Attempted to start field ${this.fieldId} when duration not set`)
      throw new BadRequestException('Timer not set')
    }

    if (this.mode === undefined) {
      this.logger.warn(`Attempted to start field ${this.fieldId} when state not set`)
      throw new BadRequestException('State not set')
    }

    this.logger.log(`Starting ${this.mode} timer for ${this.duration}ms on field ${this.fieldId}`)

    this.endTime = new Date(Date.now() + this.duration)

    const timeRemaining = this.endTime.getTime() - Date.now()

    this.timer = setTimeout(() => {
      void stopEvent.execute({ fieldId: this.fieldId })
    }, timeRemaining)
  }
}
