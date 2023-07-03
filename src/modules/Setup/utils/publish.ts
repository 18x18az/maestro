import { PathComponent, SetupStage } from '@18x18az/rosetta'
import { broadcast } from '../../../utils/broadcast'

export async function publish (stage: SetupStage): Promise<void> {
  await broadcast(PathComponent.SETUP_STAGE, stage)
}
