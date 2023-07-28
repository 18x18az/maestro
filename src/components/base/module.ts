import { FallbackLoadFunction } from '../data/database'
import { isEqual } from 'lodash'

export type R = Record<string, any>

export type InputProcessor<InputShape, OutputShape> = (input: Partial<InputShape>, current: OutputShape | undefined) => OutputShape | undefined

export type OutputFunction<OutputShape> = (identifier: string, output: OutputShape) => Promise<void>
type OutputFunctions<OutputShape> = Array<OutputFunction<OutputShape>>

type BulkOutputFunction<InputShape extends R, OutputShape> = (data: Array<DataHolder<InputShape, OutputShape>>) => Promise<void>
type BulkOutputFunctions<InputShape extends R, OutputShape> = Array<BulkOutputFunction<InputShape, OutputShape>>

export class DataHolder<InputShape extends R, OutputShape> {
  inputs: Partial<InputShape>
  output: OutputShape | undefined
  identifier: string

  setOutput (output: OutputShape): void {
    this.output = output
  }

  applyUpdate (update: Partial<InputShape>): void {
    this.inputs = {
      ...this.inputs,
      ...update
    }
  }

  constructor (identifier: string) {
    this.identifier = identifier
    this.inputs = {}
  }
}

async function broadcastUpdate<OutputShape> (identifier: string, value: OutputShape, outputs: OutputFunctions<OutputShape>): Promise<void> {
  const promises = outputs.map(async cb => {
    await cb(identifier, value)
  })

  await Promise.all(promises)
}

async function applyUpdate<InputShape extends R, OutputShape> (
  identifier: string,
  processor: InputProcessor<InputShape, OutputShape>,
  instance: DataHolder<InputShape, OutputShape>,
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

export abstract class BaseModule<InputShape extends R, OutputShape> {
  protected outputFunctions: OutputFunctions<OutputShape>
  protected processor: InputProcessor<InputShape, OutputShape>

  abstract registerLoadFunction (func: FallbackLoadFunction<OutputShape>): Promise<void>

  constructor (processor: InputProcessor<InputShape, OutputShape>) {
    this.outputFunctions = []
    this.processor = processor
  }

  abstract updateAll (update: Partial<InputShape>): Promise<boolean>

  addOutput (output: OutputFunction<OutputShape>): void {
    this.outputFunctions.push(output)
  }
}

export class SingleModule<InputShape extends R, OutputShape> extends BaseModule<InputShape, OutputShape> {
  protected instance: DataHolder<InputShape, OutputShape>

  constructor (
    identifier: string,
    processor: InputProcessor<InputShape, OutputShape>
  ) {
    super(processor)
    this.instance = new DataHolder(identifier)
  }

  async registerLoadFunction (func: FallbackLoadFunction<OutputShape>): Promise<void> {
    const loaded = await func(this.instance.identifier)
    this.instance.setOutput(loaded)
    await broadcastUpdate(this.instance.identifier, loaded, this.outputFunctions)
  }

  async updateAll (update: Partial<InputShape>): Promise<boolean> {
    this.instance.applyUpdate(update)
    const result = await applyUpdate(this.instance.identifier, this.processor, this.instance, this.outputFunctions)
    if (result === undefined) {
      return false
    } else {
      return true
    }
  }
}

export class MultiModule<InputShape extends R, OutputShape> extends BaseModule<InputShape, OutputShape> {
  instances: Map<string, DataHolder<InputShape, OutputShape>>
  bulkOutputs: BulkOutputFunctions<InputShape, OutputShape>
  loadFunction?: FallbackLoadFunction<OutputShape>

  constructor (processor: InputProcessor<InputShape, OutputShape>) {
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

  addBulkOutput (output: BulkOutputFunction<InputShape, OutputShape>): void {
    this.bulkOutputs.push(output)
  }

  async updateAll (update: Partial<InputShape>): Promise<boolean> {
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

  async createInstance (identifier: string): Promise<DataHolder<InputShape, OutputShape> | undefined> {
    if (this.instances.get(identifier) !== undefined) {
      return
    }
    const newInstance = new DataHolder<InputShape, OutputShape>(identifier)
    this.instances.set(identifier, newInstance)
    if (this.loadFunction != null) {
      const cached = await this.loadFunction(identifier)
      newInstance.setOutput(cached)
      await broadcastUpdate(identifier, cached, this.outputFunctions)
    }
    return newInstance
  }

  async updateInstance (identifier: string, update: Partial<InputShape>): Promise<boolean> {
    const instance = this.instances.get(identifier)
    if (instance === undefined) {
      return false
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
