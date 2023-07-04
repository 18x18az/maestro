import { EventStage, PathComponent, SetupStage } from '@18x18az/rosetta'
import { ModuleInstance, SingletonModule } from '../../utils/module'
import { AedesPublishPacket } from 'aedes'
import { getMessageString } from '../../utils/parser'
import { publish } from './utils/publish'
import { loadEventStage, saveEventStage } from './storage/eventStage'

class InstanceImplementation extends ModuleInstance<EventStage> {
  async saveData (data: EventStage): Promise<void> {
    await saveEventStage(data)
  }

  async broadcastData (data: EventStage): Promise<void> {
    await publish(data)
  }

  async loadData (fallback: EventStage): Promise<EventStage> {
    const data = await loadEventStage(fallback)
    return data
  }

  async handleSetupStage (stage: SetupStage): Promise<void> {
    if (stage === SetupStage.DONE && this.data === EventStage.SETUP) {
      await this.setData(EventStage.CHECK_IN)
    }
  }

  constructor () {
    super(EventStage.SETUP)
  }
}

export class EventStageModule extends SingletonModule<InstanceImplementation> {
  protected createInstance (): InstanceImplementation {
    return new InstanceImplementation()
  }

  async handleSetupStage (packet: AedesPublishPacket): Promise<void> {
    const stage = getMessageString(packet) as SetupStage
    await this.instance.handleSetupStage(stage)
  }

  constructor () {
    super()
    this.subscribe(PathComponent.SETUP_STAGE, this.handleSetupStage.bind(this))
  }
}
