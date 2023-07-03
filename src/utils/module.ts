import { AedesPublishPacket } from 'aedes'
import { broker } from '../services/mqtt'
import { Request, Response } from 'express'
import { apiRouter } from '../services/api'

let moduleId: number

const features: Map<string, ModuleInstance> = new Map()

const emptyCb = (): void => {}

function getId (): string {
  return (++moduleId).toString()
}

function register (instance: ModuleInstance): string {
  const id = getId()
  features.set(id, instance)
  return id
}

function unregister (id: string): void {
  features.delete(id)
}

export abstract class ModuleInstance {
  protected id: string
  protected teardownFunctions: Array<() => Promise<void>>

  constructor () {
    this.id = register(this)
    this.teardownFunctions = []
  }

  async teardown (): Promise<void> {
    const teardownPromises = this.teardownFunctions.map(async func => await func())
    unregister(this.id)
    await Promise.all(teardownPromises)
  }

  async cleanup (): Promise<void> {

  }

  async load (): Promise<void> {

  }

  private registerTeardown (func: () => Promise<void>): void {
    this.teardownFunctions.push(func)
  }

  handlePost (path: string, cb: (req: Request, res: Response) => Promise<void>): void {
    apiRouter.post(`/${path}`, (req, res) => { void cb(req, res) })
  }

  subscribe (topic: string, handler: (packet: AedesPublishPacket) => Promise<void>): void {
    const deliverFunc = (packet: AedesPublishPacket, cb: () => void): void => {
      cb()
      void handler(packet)
    }

    broker.subscribe(topic, deliverFunc, emptyCb)
    const teardownFunction = async (): Promise<void> => { broker.unsubscribe(topic, deliverFunc, emptyCb) }
    this.registerTeardown(teardownFunction)
  }
}

export abstract class Module<ModuleInstanceImplementation> {
  abstract cleanup (): Promise<void>
  abstract teardown (): Promise<void>
  abstract load (): Promise<void>
  protected abstract createInstance (): ModuleInstanceImplementation
}

export abstract class SingletonModule<ModuleInstanceImplementation extends ModuleInstance> extends Module<ModuleInstanceImplementation> {
  protected instance: ModuleInstanceImplementation

  constructor () {
    super()
    this.instance = this.createInstance()
  }

  async load (): Promise<void> {
    await this.instance.load()
  }

  async cleanup (): Promise<void> {
    await this.instance.cleanup()
  }

  async teardown (): Promise<void> {
    await this.instance.teardown()
  }
}

export abstract class MultiModule<ModuleInstanceImplementation extends ModuleInstance> extends Module<ModuleInstanceImplementation> {
  protected instances: Map<string, ModuleInstanceImplementation>
  protected teardownDriver: () => void

  constructor (
    driverFunction: (topic: string, cb: (instances: string[]) => Promise<void>) => () => void,
    driverTopic: string
  ) {
    super()
    this.instances = new Map()
    this.teardownDriver = driverFunction(driverTopic, this.updateInstances.bind(this))
  }

  private async updateInstances (updatedInstances: string[]): Promise<void> {
    const currentInstances = Array.from(this.instances.keys())

    const toBeRemoved = currentInstances.filter(current => !updatedInstances.some(updated => current === updated))
    const removalPromises = toBeRemoved.map(async key => await this.unregister(key))

    const toBeAdded = updatedInstances.filter(updated => !currentInstances.some(current => current === updated))
    toBeAdded.map(key => this.register(key))

    await Promise.all(removalPromises)
  }

  private getInstance (key: string): ModuleInstanceImplementation | undefined {
    return this.instances.get(key)
  }

  private register (key: string): void {
    const newInstance = this.createInstance()
    this.instances.set(key, newInstance)
  }

  private async unregister (key: string): Promise<void> {
    const instance = this.getInstance(key)

    if (instance === undefined) {
      return
    }

    this.instances.delete(key)
    await instance.teardown()
  }

  async teardown (): Promise<void> {
    const promises = Array.from(this.instances.values()).map(async (instance) => await instance.teardown())
    this.teardownDriver()
    await Promise.all(promises)
  }

  async cleanup (): Promise<void> {
    const promises = Array.from(this.instances.values()).map(async (instance) => await instance.cleanup())
    await Promise.all(promises)
  }

  async load (): Promise<void> {
    const promises = Array.from(this.instances.values()).map(async (instance) => await instance.load())
    await Promise.all(promises)
  }
}
