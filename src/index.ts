import { EventStage, PathComponent } from '@18x18az/rosetta'
import { EventStageModule } from './modules/EventStage'
import { SetupModule } from './modules/Setup'
import { TeamInfoModule } from './modules/TeamInfo'
import { broker } from './services/mqtt'
import { Module } from './utils/module'
import { AedesPublishPacket } from 'aedes'
import { getMessageString } from './utils/parser'

const modules: Array<Module<any>> = []

function register<Implementation extends Module<any>> (C: new () => Implementation): void {
  modules.push(new C())
}

register(SetupModule)
register(EventStageModule)
register(TeamInfoModule)

broker.subscribe(PathComponent.EVENT_STATE, (packet: AedesPublishPacket, cb) => {
  cb()
  const stage = getMessageString(packet) as EventStage
  if (stage === EventStage.SETUP) {
    console.log('Cleaning up previous event data')
    Array.from(modules.values()).forEach((module) => { void module.cleanup() })
  }
}, () => {})
