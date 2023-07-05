import { AedesPublishPacket } from 'aedes'
import { BaseModule, MultiModule, R } from '../base/module'
import { MessagePath, PathComponent } from '@18x18az/rosetta'
import { makeMqttPath } from '../utils/pathBuilder'
import { broker } from '../../services/mqtt'

export type SubscribeHandler<InputShape extends R> = (packet: AedesPublishPacket) => Partial<InputShape> | undefined
export type DiscerningSubscribeHandler<InputShape extends R> = (packet: AedesPublishPacket) => Array<[identifier: string, update: Partial<InputShape>]>
type AedesCb = (packet: AedesPublishPacket) => Promise<void>

const emptyCb = (): void => {}

export function addDiscerningSubscriber<InputShape extends R, OutputShape> (
  module: MultiModule<InputShape, OutputShape>, topic: MessagePath, handler: DiscerningSubscribeHandler<InputShape>): void {
  const wrapperFunction: AedesCb = async (packet) => {
    const results = handler(packet)
    const promises = results.map(async ([instance, update]) => {
      await module.updateInstance(instance, update)
    })

    await Promise.all(promises)
  }

  baseSubscribe(topic, wrapperFunction)
}

export function addSubscriber<InputShape extends R> (module: BaseModule<any, any>, topic: MessagePath, handler: SubscribeHandler<InputShape>): void {
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

export function addInstancer<InputShape extends R, OutputShape> (module: MultiModule<InputShape, OutputShape>, topic: PathComponent): void {
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
