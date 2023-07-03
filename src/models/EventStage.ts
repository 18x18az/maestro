import { EventStage } from '@18x18az/rosetta'
import { getConfig, setConfig } from './ConfigStore'
import { broadcast } from '../utils/broadcast'

const EVENT_STAGE = 'stage'

let eventStage: EventStage

export async function getEventStage (): Promise<EventStage> {
  if (eventStage !== undefined) {
    return eventStage
  }

  eventStage = await getConfig(EVENT_STAGE, EventStage.SETUP) as EventStage
  void broadcast('stage', eventStage)
  return eventStage
}

export async function setEventStage (stage: EventStage): Promise<void> {
  if (stage === eventStage) {
    return
  }

  await setConfig(EVENT_STAGE, stage)
  void broadcast('stage', stage)
}
