import { BaseClass } from './base-class'

export type EventCallback<Context> = (data: Context) => Promise<void>

export abstract class EventService<T, Context extends T> extends BaseClass {
  private readonly beforeCallbacks: Array<EventCallback<T>> = []
  private readonly afterCallbacks: Array<EventCallback<T>> = []
  private readonly completeCallbacks: Array<EventCallback<T>> = []

  constructor () {
    super()
    this.beforeCallbacks = []
    this.afterCallbacks = []
    this.completeCallbacks = []
  }

  registerBefore (callback: EventCallback<Context>): void {
    this.beforeCallbacks.push(callback)
  }

  private async executeBefore (data: Context): Promise<void> {
    const promises = this.beforeCallbacks.map(async callback => await callback(data))
    await Promise.all(promises)
  }

  registerAfter (callback: EventCallback<Context>): void {
    this.afterCallbacks.push(callback)
  }

  private async executeAfter (data: Context): Promise<void> {
    const promises = this.afterCallbacks.map(async callback => await callback(data))
    await Promise.all(promises)
  }

  registerOnComplete (callback: EventCallback<Context>): void {
    this.completeCallbacks.push(callback)
  }

  private async executeOnComplete (data: Context): Promise<void> {
    const promises = this.completeCallbacks.map(async callback => await callback(data))
    await Promise.all(promises)
  }

  protected abstract doExecute (data: Context): Promise<void>

  protected async getContext (data: T): Promise<Context> {
    this.logger.debug('Using default provided context')
    return data as Context
  }

  async execute (data: T): Promise<void> {
    this.logger.debug('Getting event context')
    const context = await this.getContext(data)
    this.logger.debug('Executing pre-event callbacks')
    await this.executeBefore(context)
    this.logger.debug('Executing event')
    await this.doExecute(context)
    this.logger.debug('Executing post-event callbacks')
    await this.executeAfter(context)
    this.logger.debug('Executing event-complete callbacks')
    await this.executeOnComplete(context)
    this.logger.debug('Event complete')
  }
}
