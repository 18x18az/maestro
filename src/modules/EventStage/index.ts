import { EventStage, PathComponent, SetupStage } from '@18x18az/rosetta'
import { ModuleInstance, SingletonModule } from '../../utils/module'
import { AedesPublishPacket } from 'aedes'
import { getMessageString } from '../../utils/parser'
import { publish } from './utils/publish'
import { loadEventStage, saveEventStage } from './storage/eventStage'

class InstanceImplementation extends ModuleInstance {
  private stage?: EventStage

  async setStage (stage: EventStage): Promise<void> {
    if (this.stage !== stage) {
      this.stage = stage
      await saveEventStage(stage)
      await publish(stage)
    }
  }

  async handleSetupStage (packet: AedesPublishPacket): Promise<void> {
    const stage = getMessageString(packet) as SetupStage

    if (stage === SetupStage.DONE && this.stage === EventStage.SETUP) {
      await this.setStage(EventStage.CHECK_IN)
    }
  }

  async load (): Promise<void> {
    const stage = await loadEventStage(EventStage.SETUP)
    await this.setStage(stage)
  }

  constructor () {
    super()
    this.subscribe(PathComponent.SETUP_STAGE, this.handleSetupStage.bind(this))
  }
}

export class EventStageModule extends SingletonModule<InstanceImplementation> {
  protected createInstance (): InstanceImplementation {
    return new InstanceImplementation()
  }
}
