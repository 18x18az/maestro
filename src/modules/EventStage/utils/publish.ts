import { EventStage, PathComponent } from '@18x18az/rosetta'
import { broadcast } from '../../../utils/broadcast'

export async function publish (stage: EventStage): Promise<void> {
  await broadcast(PathComponent.EVENT_STATE, stage)
}
