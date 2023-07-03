import { EventStage } from '@18x18az/rosetta'
import { getEventStage, setEventStage } from '../models/EventStage'

export async function load (): Promise<void> {
  let stage = await getEventStage()

  // Previous event ended so this is the start of a new event
  if (stage === EventStage.TEARDOWN) {
    // TODO this code should clean everything up
    await setEventStage(EventStage.SETUP)
    stage = EventStage.SETUP
  }
}
