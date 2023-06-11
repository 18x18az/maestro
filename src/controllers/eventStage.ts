import { EventStage } from '@18x18az/rosetta'
import { broadcast } from '../utils/broadcast'

let eventStage: EventStage = EventStage.LOADING

export async function setEventStage (stage: EventStage): Promise<void> {
  console.log(`Event Stage is now ${stage}`)
  eventStage = stage
  void broadcast('stage', stage)
}

export async function getEventStage (): Promise<EventStage> {
  if (eventStage === EventStage.LOADING) {
    await setEventStage(EventStage.TEARDOWN) // TODO have this actually get it from a database
  }

  return eventStage
}

async function setup (): Promise<void> {
  await getEventStage()
}

void setup()
