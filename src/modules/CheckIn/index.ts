import { AUTH_TYPE, CheckInState, PathComponent } from '@18x18az/rosetta'
import { InputProcessor, MultiModule, addInstancer, addSimpleDiscerningPostHandler } from '../../components'

interface Input {
  [PathComponent.CHECK_IN]: CheckInState
}

const processor: InputProcessor<Input, CheckInState> = (input, current) => {
  const update = input[PathComponent.CHECK_IN]

  if (update === undefined) {
    return
  }

  return update
}

export async function setupCheckIn (): Promise<void> {
  const module = new MultiModule(processor)

  addSimpleDiscerningPostHandler(module, PathComponent.TEAM, PathComponent.CHECK_IN, AUTH_TYPE.CHECK_IN)

  addInstancer(module, PathComponent.TEAM_LIST)

  console.log('Check In module loaded')
}
