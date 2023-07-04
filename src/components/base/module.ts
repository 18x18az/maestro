import { FallbackLoadFunction } from '../data/database'
import { isEqual } from 'lodash'

export type InputProcessor<OutputShape> = (input: Map<string, any>, current: OutputShape | undefined) => OutputShape | undefined
type DataInput = Map<string, any>

export type OutputFunction<OutputShape> = (identifier: string, output: OutputShape) => Promise<void>
type OutputFunctions<OutputShape> = Array<OutputFunction<OutputShape>>

type BulkOutputFunction<OutputShape> = (data: Array<DataHolder<OutputShape>>) => Promise<void>
type BulkOutputFunctions<OutputShape> = Array<BulkOutputFunction<OutputShape>>

export type Update = Array<[input: string, value: any]>

class DataHolder<OutputShape> {
  inputs: DataInput
  output: OutputShape | undefined
  identifier: string

  setOutput (output: OutputShape): void {
    this.output = output
  }

  applyUpdate (update: Update): void {
    update.forEach(([input, value]) => {
      this.inputs.set(input, value)
    })
  }

  constructor (identifier: string) {
    this.identifier = identifier
    this.inputs = new Map()
  }
}

async function broadcastUpdate<OutputShape> (identifier: string, value: OutputShape, outputs: OutputFunctions<OutputShape>): Promise<void> {
  const promises = outputs.map(async cb => {
    await cb(identifier, value)
  })

  await Promise.all(promises)
}

async function applyUpdate<OutputShape> (
  identifier: string,
  processor: InputProcessor<OutputShape>,
  instance: DataHolder<OutputShape>,
  outputs: OutputFunctions<OutputShape>
): Promise<OutputShape | undefined> {
  const result = processor(instance.inputs, instance.output)

  if (result === undefined) {
    return
  }

  if (isEqual(instance.output, result)) {
    return
  }

  instance.output = result

  await broadcastUpdate(identifier, result, outputs)
  return result
}

export abstract class BaseModule<OutputShape> {
  protected outputFunctions: OutputFunctions<OutputShape>
  protected processor: InputProcessor<OutputShape>

  abstract registerLoadFunction (func: FallbackLoadFunction<OutputShape>): Promise<void>

  constructor (processor: InputProcessor<OutputShape>) {
    this.outputFunctions = []
    this.processor = processor
  }

  abstract updateAll (update: Update): Promise<boolean>

  addOutput (output: OutputFunction<OutputShape>): void {
    this.outputFunctions.push(output)
  }
}

export class SingleModule<OutputShape> extends BaseModule<OutputShape> {
  protected instance: DataHolder<OutputShape>

  constructor (
    identifier: string,
    processor: InputProcessor<OutputShape>
  ) {
    super(processor)
    this.instance = new DataHolder(identifier)
  }

  async registerLoadFunction (func: FallbackLoadFunction<OutputShape>): Promise<void> {
    const loaded = await func(this.instance.identifier)
    this.instance.setOutput(loaded)
    await broadcastUpdate(this.instance.identifier, loaded, this.outputFunctions)
  }

  async updateAll (update: Update): Promise<boolean> {
    this.instance.applyUpdate(update)
    const result = await applyUpdate(this.instance.identifier, this.processor, this.instance, this.outputFunctions)
    if (result === undefined) {
      return false
    } else {
      return true
    }
  }
}

export class MultiModule<OutputShape> extends BaseModule<OutputShape> {
  instances: Map<string, DataHolder<OutputShape>>
  bulkOutputs: BulkOutputFunctions<OutputShape>
  loadFunction?: FallbackLoadFunction<OutputShape>

  constructor (processor: (input: Record<string, any>) => OutputShape | undefined) {
    super(processor)
    this.bulkOutputs = []
    this.instances = new Map()
  }

  async registerLoadFunction (func: FallbackLoadFunction<OutputShape>): Promise<void> {
    this.loadFunction = func
    const backlog = Array.from(this.instances.entries()).map(async ([identifier, instance]) => {
      const loaded = await func(identifier)
      instance.setOutput(loaded)
      await broadcastUpdate(identifier, loaded, this.outputFunctions)
    })

    await Promise.all(backlog)
  }

  addBulkOutput (output: BulkOutputFunction<OutputShape>): void {
    this.bulkOutputs.push(output)
  }

  async updateAll (update: Update): Promise<boolean> {
    let anyUpdates = false
    const promises = Array.from(this.instances.entries()).map(async ([identifier, instance]) => {
      instance.applyUpdate(update)

      const result = await applyUpdate(identifier, this.processor, instance, this.outputFunctions)
      if (result !== undefined) {
        anyUpdates = true
        instance.output = result
      }
    })
    await Promise.all(promises)

    if (anyUpdates) {
      await this.sendBulkPromises()
    }

    return true
  }

  private async sendBulkPromises (): Promise<void> {
    const updates = Array.from(this.instances.values())
    const bulkPromises = this.bulkOutputs.map(async output => {
      await output(updates)
    })

    await Promise.all(bulkPromises)
  }

  async createInstance (identifier: string): Promise<DataHolder<OutputShape> | undefined> {
    if (this.instances.get(identifier) !== undefined) {
      return
    }
    const newInstance = new DataHolder<OutputShape>(identifier)
    this.instances.set(identifier, newInstance)
    if (this.loadFunction != null) {
      const cached = await this.loadFunction(identifier)
      newInstance.setOutput(cached)
      await broadcastUpdate(identifier, cached, this.outputFunctions)
    }
    return newInstance
  }

  async updateInstance (identifier: string, update: Update): Promise<boolean> {
    let instance = this.instances.get(identifier)
    if (instance === undefined) {
      instance = await this.createInstance(identifier)
      if (instance === undefined) {
        console.log("this shouldn't happen")
        return false
      }
    }
    instance.applyUpdate(update)

    const result = await applyUpdate(identifier, this.processor, instance, this.outputFunctions)
    if (result === undefined) {
      return false
    } else {
      await this.sendBulkPromises()
      return true
    }
  }
}
