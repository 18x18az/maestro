import { EventStage, MessagePath, PathComponent, SetupStage } from '@18x18az/rosetta'
import { loadValueForKey, saveValueForKey } from '../../components/data/KeyValueStore'
import { BroadcastBuilder, InputProcessor, LoadFunction, SaveFunction, SingleModule, SubscribeHandler, addBroadcastOutput, addDatabaseLinkage, addSubscriber, getMessageString } from '../../components'

const processor: InputProcessor<EventStage> = (input, current) => {
  const setupStage = input.get(PathComponent.SETUP_STAGE) as SetupStage | undefined

  if (setupStage === SetupStage.DONE) {
    return EventStage.CHECK_IN
  }

  if (current === EventStage.TEARDOWN && setupStage === SetupStage.EVENT_CODE) {
    return EventStage.SETUP
  }
}

const setupStageHandler: SubscribeHandler = (packet) => {
  const stage = getMessageString(packet) as SetupStage
  return [[PathComponent.SETUP_STAGE, stage]]
}

const broadcastBuilder: BroadcastBuilder<EventStage> = (identifier, value) => {
  const topic: MessagePath = [[], PathComponent.EVENT_STATE]

  return [topic, value]
}

const saveFunction: SaveFunction<EventStage> = async (identifier, value) => {
  await saveValueForKey(identifier, value)
}

const loadFunction: LoadFunction<EventStage> = async (identifier) => {
  return await loadValueForKey(identifier) as EventStage
}

export async function setupEventStage (): Promise<void> {
  const module = new SingleModule(PathComponent.EVENT_STATE, processor)

  addSubscriber(module, [[], PathComponent.SETUP_STAGE], setupStageHandler)
  addBroadcastOutput(module, broadcastBuilder)

  await addDatabaseLinkage(module, saveFunction, loadFunction, EventStage.SETUP)
}
