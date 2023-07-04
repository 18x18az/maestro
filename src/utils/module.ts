import { AedesPublishPacket } from 'aedes'
import { broker } from '../services/mqtt'
import { Request, Response } from 'express'
import { apiRouter } from '../services/api'

const emptyCb = (): void => {}

export abstract class ModuleInstance<DataShape> {
  data?: DataShape
  key: string

  async saveData (data: DataShape): Promise<void> {

  }

  async broadcastData (data: DataShape): Promise<void> {

  }

  async loadData (fallback: DataShape): Promise<DataShape> {
    return fallback
  }

  private async setup (fallback: DataShape): Promise<void> {
    const data = await this.loadData(fallback)
    await this.setData(data)
  }

  constructor (key: string, fallback?: DataShape) {
    this.key = key
    if (fallback !== undefined) {
      void this.setup(fallback)
    }
  }

  async setData (data: DataShape): Promise<void> {
    if (data === this.data) {
      return
    }

    this.data = data
    await this.saveData(data)
    await this.broadcastData(data)
  }
}

export abstract class Module<ModuleInstanceImplementation> {
  async cleanup (): Promise<void> {

  }

  protected abstract createInstance (key: string): ModuleInstanceImplementation

  handlePost (path: string, cb: (req: Request, res: Response) => Promise<void>): void {
    apiRouter.post(`/${path}`, (req, res) => { void cb(req, res) })
  }

  subscribe (topic: string, handler: (packet: AedesPublishPacket) => Promise<void>): void {
    const deliverFunc = (packet: AedesPublishPacket, cb: () => void): void => {
      cb()
      void handler(packet)
    }

    broker.subscribe(topic, deliverFunc, emptyCb)
  }
}

export abstract class SingletonModule<ModuleInstanceImplementation extends ModuleInstance<any>> extends Module<ModuleInstanceImplementation> {
  protected instance: ModuleInstanceImplementation

  constructor () {
    super()
    this.instance = this.createInstance('1')
  }
}

export abstract class MultiModule<ModuleInstanceImplementation extends ModuleInstance<any>> extends Module<ModuleInstanceImplementation> {
  protected instances: Map<string, ModuleInstanceImplementation>

  constructor () {
    super()
    this.instances = new Map()
  }

  async updateInstances (updatedInstances: string[]): Promise<void> {
    const currentInstances = Array.from(this.instances.keys())

    const toBeRemoved = currentInstances.filter(current => !updatedInstances.some(updated => current === updated))
    const removalPromises = toBeRemoved.map(async key => await this.unregister(key))

    const toBeAdded = updatedInstances.filter(updated => !currentInstances.some(current => current === updated))
    toBeAdded.map(key => this.register(key))

    await Promise.all(removalPromises)
  }

  getInstance (key: string): ModuleInstanceImplementation | undefined {
    return this.instances.get(key)
  }

  register (key: string): ModuleInstanceImplementation {
    const newInstance = this.createInstance(key)
    this.instances.set(key, newInstance)
    return newInstance
  }

  private async unregister (key: string): Promise<void> {
    const instance = this.getInstance(key)

    if (instance === undefined) {
      return
    }

    this.instances.delete(key)
  }

  async cleanup (): Promise<void> {}
}
