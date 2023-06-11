import { ConnectionState, EventStage } from '@18x18az/rosetta'
import { broadcast } from '../utils/broadcast'
import { getEventStage, setEventStage } from './eventStage'

let databaseState = ConnectionState.CONNECTING
let webState = ConnectionState.CONNECTING
let mobileState = ConnectionState.CONNECTING

export async function evaluateMiddlemanState (): Promise<void> {
  if (await getEventStage() === EventStage.LOADING && databaseState === ConnectionState.CONNECTED && webState === ConnectionState.CONNECTED && mobileState === ConnectionState.CONNECTED) {
    await setEventStage(EventStage.EVENT)
  }
}

export async function setDatabaseState (state: ConnectionState): Promise<void> {
  console.log(`Middleman database is ${state}`)
  databaseState = state
  void broadcast('state/middleman/database', state)
  await evaluateMiddlemanState()
}

export async function setWebState (state: ConnectionState): Promise<void> {
  console.log(`Middleman web connection is ${state}`)
  webState = state
  void broadcast('state/middleman/web', state)
  await evaluateMiddlemanState()
}

export async function setMobileState (state: ConnectionState): Promise<void> {
  console.log(`Middleman mobile connection is ${state}`)
  mobileState = state
  void broadcast('state/middleman/mobile', state)
  await evaluateMiddlemanState()
}
