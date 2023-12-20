import { BaseClass } from './base-class'

export type EventCallback<Context> = (data: Context) => Promise<void>

export abstract class EventService<T, StartContext extends T, EndContext extends StartContext> extends BaseClass {
  private readonly beforeCallbacks: Array<EventCallback<T>> = []
  private readonly afterCallbacks: Array<EventCallback<T>> = []
  private readonly completeCallbacks: Array<EventCallback<T>> = []

  constructor () {
    super()
    this.beforeCallbacks = []
    this.afterCallbacks = []
    this.completeCallbacks = []
  }

  registerBefore (callback: EventCallback<StartContext>): void {
    this.beforeCallbacks.push(callback)
  }

  private async executeBefore (data: StartContext): Promise<void> {
    const promises = this.beforeCallbacks.map(async callback => await callback(data))
    await Promise.all(promises)
  }

  registerAfter (callback: EventCallback<EndContext>): void {
    this.afterCallbacks.push(callback)
  }

  private async executeAfter (data: EndContext): Promise<void> {
    const promises = this.afterCallbacks.map(async callback => await callback(data))
    await Promise.all(promises)
  }

  registerOnComplete (callback: EventCallback<EndContext>): void {
    this.completeCallbacks.push(callback)
  }

  private async executeOnComplete (data: EndContext): Promise<void> {
    const promises = this.completeCallbacks.map(async callback => await callback(data))
    await Promise.all(promises)
  }

  protected abstract doExecute (data: StartContext): Promise<EndContext>

  protected async getContext (data: T): Promise<StartContext> {
    this.logger.debug('Using default provided context')
    return data as StartContext
  }

  async execute (data: T): Promise<EndContext> {
    this.logger.debug('Getting event context')
    const context = await this.getContext(data)
    this.logger.debug('Executing pre-event callbacks')
    await this.executeBefore(context)
    this.logger.debug('Executing event')
    const result = await this.doExecute(context)
    this.logger.debug('Executing post-event callbacks')
    await this.executeAfter(result)
    this.logger.debug('Executing event-complete callbacks')
    await this.executeOnComplete(result)
    this.logger.debug('Event complete')
    return result
  }
}
