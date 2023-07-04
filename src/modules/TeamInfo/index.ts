import { TeamInfo } from '@18x18az/rosetta'
import { ModuleInstance, MultiModule } from '../../utils/module'

class InstanceImplementation extends ModuleInstance<TeamInfo> {

}

export class TeamInfoModule extends MultiModule<InstanceImplementation> {
  protected createInstance (): InstanceImplementation {
    return new InstanceImplementation()
  }
}
