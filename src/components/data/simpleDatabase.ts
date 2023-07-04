import { BaseModule } from '../base/module'
import { LoadFunction, SaveFunction, addDatabaseLinkage } from './database'
import { loadValueForKey, saveValueForKey } from './KeyValueStore'

export const addSimpleSingleDatabase = async (module: BaseModule<any>, fallback: any): Promise<void> => {
  const saveFunction: SaveFunction<any> = async (identifier, value) => {
    await saveValueForKey(identifier, value)
  }

  const loadFunction: LoadFunction<any> = async (identifier) => {
    return await loadValueForKey(identifier)
  }

  await addDatabaseLinkage(module, saveFunction, loadFunction, fallback)
}
