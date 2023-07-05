import { PathComponent } from '@18x18az/rosetta'
import { getMessageString } from '../utils/parser'
import { SubscribeHandler, addSubscriber } from './subscribe'
import { BaseModule, R } from '../base/module'

function simpleSingleSubscriberFactory<InputShape extends R> (resource: keyof InputShape & PathComponent): SubscribeHandler<InputShape> {
  return (packet): Partial<InputShape> => {
    const value = getMessageString(packet)
    const retVal: Partial<InputShape> = { [resource]: value } as any
    return retVal
  }
}

export const addSimpleSingleSubscriber = <InputShape extends R>(module: BaseModule<InputShape, any>, resource: keyof InputShape & PathComponent): void => {
  const handler = simpleSingleSubscriberFactory(resource)
  addSubscriber(module, [[], resource], handler)
}
