import { PathComponent } from '@18x18az/rosetta'
import { getMessageString } from '../utils/parser'
import { SubscribeHandler, addSubscriber } from './subscribe'
import { BaseModule } from '../base/module'

function simpleSingleSubscriberFactory (resource: PathComponent): SubscribeHandler {
  return (packet) => {
    const value = getMessageString(packet)
    return [[resource, value]]
  }
}

export const addSimpleSingleSubscriber = (module: BaseModule<any>, resource: PathComponent): void => {
  const handler = simpleSingleSubscriberFactory(resource)
  addSubscriber(module, [[], resource], handler)
}
