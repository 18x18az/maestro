import { MessagePath } from '@18x18az/rosetta'
import { BaseModule, OutputFunction } from '../base/module'
import { makeMqttPath } from '../utils/pathBuilder'
import { broker } from '../../services/mqtt'

export type BroadcastBuilder<DataShape> = (identifier: string, value: DataShape) => [topic: MessagePath, payload: any]

async function broadcast (topic: MessagePath, payload: any): Promise<void> {
  const topicString = makeMqttPath(topic)
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

export function addBroadcastOutput<OutputShape> (module: BaseModule<any, OutputShape>, builder: BroadcastBuilder<OutputShape>): void {
  const broadcastFunction: OutputFunction<OutputShape> = async (identifier, value) => {
    const [topic, payload] = builder(identifier, value)
    await broadcast(topic, payload)
  }
  module.addOutput(broadcastFunction)
}
