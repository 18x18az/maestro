import { EventStageModule } from './modules/EventStage'
import { SetupModule } from './modules/Setup'
import { Module } from './utils/module'

const modules: Array<Module<any>> = []

function register<Implementation extends Module<any>> (C: new () => Implementation): void {
  modules.push(new C())
}

register(SetupModule)
register(EventStageModule)

modules.map(async module => await module.load())
