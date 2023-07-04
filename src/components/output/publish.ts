import { MessagePath } from '@18x18az/rosetta'
import { BaseModule, OutputFunction } from '../base/module'
import { makeMqttPath } from '../utils/pathBuilder'
import { broker } from '../../services/mqtt'

export type BroadcastBuilder<DataShape> = (identifier: string, value: DataShape) => [topic: MessagePath, payload: any]

async function broadcast (topic: MessagePath, payload: any): Promise<void> {
  const topicString = makeMqttPath(topic)
  console.log(`Publishing ${String(payload)} to ${topicString}`)
  broker.publish({
    topic: topicString,
    payload: JSON.stringify(payload),
    cmd: 'publish',
    qos: 2,
    dup: false,
    retain: true
  }, (error) => {
    if (error != null) {
      console.log(error)
    }
  })
}

export function addBroadcastOutput<DataShape> (module: BaseModule<DataShape>, builder: BroadcastBuilder<DataShape>): void {
  const broadcastFunction: OutputFunction<DataShape> = async (identifier, value) => {
    const [topic, payload] = builder(identifier, value)
    await broadcast(topic, payload)
  }
  module.addOutput(broadcastFunction)
}
