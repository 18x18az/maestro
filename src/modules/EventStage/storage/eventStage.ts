import { EventStage } from '@18x18az/rosetta'
import { loadValueForKey, saveValueForKey } from '../../../storage/KeyValueStore'

const EVENT_STAGE = 'eventStage'

export async function loadEventStage (fallback: EventStage): Promise<EventStage> {
  const eventStage = await loadValueForKey(EVENT_STAGE, fallback) as EventStage
  return eventStage
}

export async function saveEventStage (stage: EventStage): Promise<void> {
  await saveValueForKey(EVENT_STAGE, stage)
}
