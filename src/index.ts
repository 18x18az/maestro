import { load } from './services/load'
import { SetupModule } from './modules/Setup'
import { Module } from './utils/module'

const modules: Array<Module<any>> = []

function register<Implementation extends Module<any>> (C: new () => Implementation): void {
  modules.push(new C())
}

void load()

register(SetupModule)

modules.map(async module => await module.load())
