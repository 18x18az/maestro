import { ConnectionInfo, ConnectionState, EventStage } from '@18x18az/rosetta'
import { broadcast } from '../utils/broadcast'
import { getEventStage, setEventStage } from './eventStage'

let databaseState = ConnectionState.CONNECTING
let webState = ConnectionState.CONNECTING
let mobileState = ConnectionState.CONNECTING

export async function evaluateMiddlemanState (): Promise<void> {
  const stage = await getEventStage()

  if (stage === EventStage.LOADING && databaseState === ConnectionState.CONNECTED && webState === ConnectionState.CONNECTED && mobileState === ConnectionState.CONNECTED) {
    await setEventStage(EventStage.EVENT)
  }

  if (stage === EventStage.TEARDOWN && webState === ConnectionState.AUTH) {
    await setEventStage(EventStage.SETUP)
  }
}

export async function setState (component: string, info: ConnectionInfo): Promise<void> {
  void broadcast(`state/middleman/${component}`, info)
}

export async function setDatabaseState (info: ConnectionInfo): Promise<void> {
  const state = info.state
  console.log(`Middleman database is ${state}`)
  databaseState = state
  await setState('database', info)
  await evaluateMiddlemanState()
}

export async function setWebState (info: ConnectionInfo): Promise<void> {
  const state = info.state
  console.log(`Middleman web connection is ${state}`)
  webState = state
  await setState('web', info)
  await evaluateMiddlemanState()
}

export async function setMobileState (info: ConnectionInfo): Promise<void> {
  const state = info.state
  console.log(`Middleman mobile connection is ${state}`)
  mobileState = state
  await setState('mobile', info)
  await evaluateMiddlemanState()
}
