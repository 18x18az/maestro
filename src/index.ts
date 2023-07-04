import { EventStageModule } from './modules/EventStage'
import { SetupModule } from './modules/Setup'
import { TeamInfoModule } from './modules/TeamInfo'
import { Module } from './utils/module'

const modules: Array<Module<any>> = []

function register<Implementation extends Module<any>> (C: new () => Implementation): void {
  modules.push(new C())
}

register(SetupModule)
register(EventStageModule)
register(TeamInfoModule)
