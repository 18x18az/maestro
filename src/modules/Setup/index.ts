import { AUTH_TYPE, EventCode, EventStage, PathComponent, SetupStage } from '@18x18az/rosetta'
import { InputProcessor, SingleModule, Validator, addSimpleSingleBroadcast, addSimpleSinglePostHandler, addSimpleSingleSubscriber } from '../../components'

interface Input {
  [PathComponent.EVENT_STATE]: EventStage
  [PathComponent.EVENT_CODE]: EventCode
}

const processor: InputProcessor<Input, SetupStage> = (input, current) => {
  const eventStage = input[PathComponent.EVENT_STATE]
  const code = input[PathComponent.EVENT_CODE]

  if (eventStage !== undefined && eventStage !== EventStage.SETUP) {
    console.log('Detected that setup is complete')
    return SetupStage.NONE
  }

  if ((current === undefined || current === SetupStage.NONE) && eventStage === EventStage.SETUP) {
    console.log('Awaiting TM code')
    return SetupStage.EVENT_CODE
  }

  if (current === SetupStage.EVENT_CODE && code !== undefined) {
    if (code.eventCode === 'test') {
      console.log('Faking teams without TM')
      return SetupStage.DONE
    }
  }
}

const codeValidator: Validator<EventCode> = (data) => {
  if (data.eventCode === undefined) {
    return false
  }

  if (data.tmCode === undefined) {
    return false
  }
  return true
}

export function setupEventSetup (): void {
  const module = new SingleModule(PathComponent.SETUP_STAGE, processor)

  addSimpleSingleSubscriber(module, PathComponent.EVENT_STATE)
  addSimpleSinglePostHandler(module, PathComponent.EVENT_CODE, AUTH_TYPE.LOCAL, codeValidator)

  addSimpleSingleBroadcast(module, PathComponent.SETUP_STAGE)
  console.log('Event Setup module loaded')
}
