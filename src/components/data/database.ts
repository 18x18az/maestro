import { BaseModule, OutputFunction } from '../base/module'

export type GenericObject = { [key: string]: any } | string

export type SaveFunction<DataShape> = (identifier: string, value: DataShape) => Promise<void>
export type LoadFunction<DataShape> = (identifier: string) => Promise<DataShape | undefined>
export type FallbackLoadFunction<OutputShape> = (instance: string) => Promise<OutputShape>

export async function addDatabaseLinkage<OutputShape> (module: BaseModule<any, OutputShape>, saveFunction: SaveFunction<OutputShape>, loadFunction: LoadFunction<OutputShape>, fallback: OutputShape): Promise<void> {
  const saveOutput: OutputFunction<OutputShape> = async (identifier, value) => {
    await saveFunction(identifier, value)
  }
  module.addOutput(saveOutput)
  const loadWrapper: (identifier: string) => Promise<OutputShape> = async (identifier: string) => {
    const loaded = await loadFunction(identifier)
    if (loaded === undefined) {
      return fallback
    } else {
      return loaded
    }
  }
  await module.registerLoadFunction(loadWrapper)
}
