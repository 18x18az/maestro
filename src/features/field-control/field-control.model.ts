import { BadRequestException, Logger } from '@nestjs/common'
import { CONTROL_MODE, FieldControlEndCb, FieldControlStatus } from './field-control.interface'

export class FieldControlModel {
  private timer: null | NodeJS.Timeout = null
  private endTime: Date | null = null
  private duration: number | null = null
  private state: CONTROL_MODE | undefined

  private endCb: null | FieldControlEndCb = null

  private readonly logger: Logger = new Logger(FieldControlModel.name)

  constructor (private readonly fieldId: number, private readonly publishCb: (fieldId: number, state: FieldControlStatus) => Promise<void>) {}

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

    await this.publish()

    if (this.endCb !== null) {
      void this.endCb(this.fieldId)
    }

    this.logger.log(`Field ${this.fieldId} stopped with ${timeRemaining}ms remaining`)
    return timeRemaining
  }

  public isRunning (): boolean {
    return this.timer !== null
  }

  public getState (): CONTROL_MODE | undefined {
    return this.state
  }

  public async load (mode: CONTROL_MODE, duration: number): Promise<void> {
    if (this.timer !== null) {
      this.logger.warn(`Attempted to load field ${this.fieldId} when already running`)
      throw new BadRequestException('Timer already started')
    }

    this.logger.log(`Loading ${mode} timer for ${duration}ms on field ${this.fieldId}`)

    this.state = mode
    this.duration = duration

    await this.publish()
  }

  public async start (endCb?: FieldControlEndCb): Promise<void> {
    if (this.timer !== null) {
      this.logger.warn(`Attempted to start field ${this.fieldId} when already running`)
      throw new BadRequestException('Timer already started')
    }

    if (this.duration === null) {
      this.logger.warn(`Attempted to start field ${this.fieldId} when duration not set`)
      throw new BadRequestException('Timer not set')
    }

    if (this.state === undefined) {
      this.logger.warn(`Attempted to start field ${this.fieldId} when state not set`)
      throw new BadRequestException('State not set')
    }

    this.logger.log(`Starting ${this.state} timer for ${this.duration}ms on field ${this.fieldId}`)

    this.endTime = new Date(Date.now() + this.duration)
    await this.publish()

    this.endCb = endCb ?? null

    const timeRemaining = this.endTime.getTime() - Date.now()

    this.timer = setTimeout(() => {
      void this.stop()
    }, timeRemaining)
  }

  private async publish (): Promise<void> {
    if (this.state === undefined) {
      throw new Error('State not set')
    }

    await this.publishCb(this.fieldId, {
      mode: this.state,
      endTime: this.endTime,
      duration: this.duration
    })
  }
}
