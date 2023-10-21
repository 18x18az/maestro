import { Injectable, Logger } from '@nestjs/common'
import { FieldState, FieldsPublisher } from './fields.publisher'
import { FieldInfo } from './fields.interface'
import { FieldRepo } from './field.repo'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)
  private readonly outstandingTimers: Map<string, NodeJS.Timeout>
  constructor (private readonly publisher: FieldsPublisher, private readonly repo: FieldRepo
  ) {
    this.outstandingTimers = new Map()
  }

  async runTestMatch (fieldId: string): Promise<void> {
    this.logger.log(`Starting test match on field ${fieldId}`)
    void this.runTime(fieldId, FieldState.AUTO, 15)
    await new Promise((resolve) => setTimeout(resolve, 20000))
    void this.runTime(fieldId, FieldState.DRIVER, 105)
    await new Promise((resolve) => setTimeout(resolve, 20000))
    await this.endEarly(fieldId)
  }

  async clearTimer (fieldId: string): Promise<void> {
    this.logger.log(`Timer complete for field ${fieldId}`)
    await this.publisher.publishField(fieldId, { state: FieldState.DISABLED })
    this.outstandingTimers.delete(fieldId)
  }

  async endEarly (fieldId: string): Promise<void> {
    this.logger.log(`Ending early on field ${fieldId}`)
    const isCompletedTimeout = this.outstandingTimers.get(fieldId)
    if (isCompletedTimeout != null) {
      clearTimeout(isCompletedTimeout)
      await this.clearTimer(fieldId)
    }
  }

  async runTime (fieldId: string, mode: FieldState, seconds: number): Promise<void> {
    const millis = seconds * 1000
    const endTime = new Date(Date.now() + millis)

    void this.publisher.publishField(fieldId, { state: mode, endTime })

    const remainingTime = endTime.getTime() - Date.now()
    const isCompletedTimeout = setTimeout(() => { void this.clearTimer(fieldId) }, remainingTime)
    this.outstandingTimers.set(fieldId, isCompletedTimeout)
    this.logger.log(`Running ${mode} for ${seconds} seconds on field ${fieldId}`)
  }

  async createField (field: FieldInfo): Promise<void> {
    await this.repo.createField(field)
  }
}
