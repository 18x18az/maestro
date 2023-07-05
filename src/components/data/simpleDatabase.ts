import { BaseModule } from '../base/module'
import { GenericObject, LoadFunction, SaveFunction, addDatabaseLinkage } from './database'
import { loadValueForKey, saveValueForKey } from './KeyValueStore'

export const addSimpleSingleDatabase = async <OutputShape extends GenericObject>(module: BaseModule<any, OutputShape>, fallback: any): Promise<void> => {
  const saveFunction: SaveFunction<OutputShape> = async (identifier, value) => {
    await saveValueForKey(identifier, value)
  }

  const loadFunction: LoadFunction<OutputShape> = async (identifier) => {
    return await loadValueForKey(identifier)
  }

  await addDatabaseLinkage(module, saveFunction, loadFunction, fallback)
}
