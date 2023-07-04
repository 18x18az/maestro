import { EventStage, PathComponent, SetupStage } from '@18x18az/rosetta'
import { InputProcessor, SingleModule, addSimpleSingleBroadcast, addSimpleSingleDatabase, addSimpleSingleSubscriber } from '../../components'

const processor: InputProcessor<EventStage> = (input, current) => {
  const setupStage = input.get(PathComponent.SETUP_STAGE) as SetupStage | undefined

  if (setupStage === SetupStage.DONE) {
    return EventStage.CHECK_IN
  }

  if (current === EventStage.TEARDOWN && setupStage === SetupStage.EVENT_CODE) {
    return EventStage.SETUP
  }
}

export async function setupEventStage (): Promise<void> {
  const module = new SingleModule(PathComponent.EVENT_STATE, processor)

  addSimpleSingleSubscriber(module, PathComponent.SETUP_STAGE)
  addSimpleSingleBroadcast(module, PathComponent.EVENT_STATE)

  await addSimpleSingleDatabase(module, EventStage.SETUP)
}
