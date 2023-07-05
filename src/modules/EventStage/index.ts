import { AUTH_TYPE, EventStage, PathComponent, SetupStage } from '@18x18az/rosetta'
import { InputProcessor, SingleModule, addSimpleSingleBroadcast, addSimpleSingleDatabase, addSimpleSinglePostHandler, addSimpleSingleSubscriber } from '../../components'

interface Input {
  [PathComponent.SETUP_STAGE]: SetupStage
  [PathComponent.RESET]: { cmd: EventStage }
}

const processor: InputProcessor<Input, EventStage> = (input, current) => {
  const setupStage = input[PathComponent.SETUP_STAGE]
  const command = input[PathComponent.RESET]?.cmd

  if (setupStage === SetupStage.DONE) {
    console.log('Initial setup completed')
    return EventStage.CHECK_IN
  }

  if (current === EventStage.TEARDOWN && setupStage === SetupStage.EVENT_CODE) {
    console.log('Detected start of new event, resetting')
    return EventStage.SETUP
  }

  if (command === EventStage.SETUP && current !== EventStage.SETUP) {
    console.log('Received command to manually reset')
    return EventStage.SETUP
  }
}

export async function setupEventStage (): Promise<void> {
  const module = new SingleModule(PathComponent.EVENT_STATE, processor)

  addSimpleSingleSubscriber(module, PathComponent.SETUP_STAGE)
  addSimpleSinglePostHandler(module, PathComponent.RESET, AUTH_TYPE.LOCAL)

  addSimpleSingleBroadcast(module, PathComponent.EVENT_STATE)

  await addSimpleSingleDatabase(module, EventStage.SETUP)
  console.log('Event Stage module loaded')
}
