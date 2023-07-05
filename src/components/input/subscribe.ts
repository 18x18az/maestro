import { AedesPublishPacket } from 'aedes'
import { BaseModule, MultiModule, Update } from '../base/module'
import { MessagePath, PathComponent } from '@18x18az/rosetta'
import { makeMqttPath } from '../utils/pathBuilder'
import { broker } from '../../services/mqtt'

export type SubscribeHandler = (packet: AedesPublishPacket) => Update | undefined
export type DiscerningSubscribeHandler = (packet: AedesPublishPacket) => Array<[identifier: string, update: Update]>
type AedesCb = (packet: AedesPublishPacket) => Promise<void>

const emptyCb = (): void => {}

export function addDiscerningSubscriber (
  module: MultiModule<any>, topic: MessagePath, handler: DiscerningSubscribeHandler): void {
  const wrapperFunction: AedesCb = async (packet) => {
    const results = handler(packet)
    const promises = results.map(async ([instance, update]) => {
      await module.updateInstance(instance, update)
    })

    await Promise.all(promises)
  }

  baseSubscribe(topic, wrapperFunction)
}

export function addSubscriber (module: BaseModule<any>, topic: MessagePath, handler: SubscribeHandler): void {
  const wrapperFunction: AedesCb = async (packet) => {
    const result = handler(packet)
    if (result !== undefined) {
      await module.updateAll(result)
    }
  }
  baseSubscribe(topic, wrapperFunction)
}

function baseSubscribe (topic: MessagePath, handler: AedesCb): void {
  const topicString = makeMqttPath(topic)
  const deliverFunc = (packet: AedesPublishPacket, cb: () => void): void => {
    cb()
    void handler(packet)
  }

  broker.subscribe(topicString, deliverFunc, emptyCb)
}

export function addInstancer (module: MultiModule<any>, topic: PathComponent): void {
  const fullTopic: MessagePath = [[], topic]
  const creatorFunction: AedesCb = async (packet) => {
    const instances = JSON.parse(packet.payload.toString()) as string[]
    const promises = instances.map(async (instance) => {
      await module.createInstance(instance)
    })
    await Promise.all(promises)
  }
  baseSubscribe(fullTopic, creatorFunction)
}
