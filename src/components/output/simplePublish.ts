import { MessagePath, PathComponent } from '@18x18az/rosetta'
import { BroadcastBuilder, addBroadcastOutput } from './publish'
import { BaseModule } from '../base/module'

function singleBroadcastBuilderFactory (topic: PathComponent): BroadcastBuilder<any> {
  const broadcastBuilder: BroadcastBuilder<any> = (identifier, value) => {
    const fullTopic: MessagePath = [[], topic]

    return [fullTopic, value]
  }

  return broadcastBuilder
}

export const addSimpleSingleBroadcast = (module: BaseModule<any>, topic: PathComponent): void => {
  const handler = singleBroadcastBuilderFactory(topic)
  addBroadcastOutput(module, handler)
}
