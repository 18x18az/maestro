import { EventStage } from '@18x18az/rosetta'
import { broadcast } from '../utils/broadcast'
import { getEventStage, setEventStage } from './eventStage'
import { evaluateMiddlemanState } from './middleman'

const eventName = ''

export async function setEventName (name: string): Promise<void> {
  if (name !== eventName) {
    void broadcast('/eventName', name)
    console.log(`Event name is now ${name}`)

    const stage = await getEventStage()

    if (stage === EventStage.TEARDOWN) {
      await setEventStage(EventStage.LOADING)
    } else if (stage === EventStage.LOADING) {
      await evaluateMiddlemanState()
    }
  }
}

export async function getEventName (): Promise<String> {
  return eventName // TODO database
}

export async function setup (): Promise<void> {
  await getEventName()
}

void setup()
