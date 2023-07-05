import { AUTH_TYPE, CheckInState, DATA_KEY, PathComponent } from '@18x18az/rosetta'
import { InputProcessor, MultiModule, addInstancer, addSimpleDiscerningPostHandler } from '../../components'

const processor: InputProcessor<CheckInState> = (input, current) => {
  const update = input.get(PathComponent.CHECK_IN)[DATA_KEY] as CheckInState

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
