import { BaseModule, OutputFunction } from '../base/module'

export type SaveFunction<DataShape> = (identifier: string, value: DataShape) => Promise<void>
export type LoadFunction<DataShape> = (identifier: string) => Promise<DataShape | undefined>
export type FallbackLoadFunction<OutputShape> = (instance: string) => Promise<OutputShape>

export async function addDatabaseLinkage<DataShape> (module: BaseModule<DataShape>, saveFunction: SaveFunction<DataShape>, loadFunction: LoadFunction<DataShape>, fallback: DataShape): Promise<void> {
  const saveOutput: OutputFunction<DataShape> = async (identifier, value) => {
    await saveFunction(identifier, value)
  }
  module.addOutput(saveOutput)
  const loadWrapper: (identifier: string) => Promise<DataShape> = async (identifier: string) => {
    const loaded = await loadFunction(identifier)
    if (loaded === undefined) {
      return fallback
    } else {
      return loaded
    }
  }
  await module.registerLoadFunction(loadWrapper)
}
