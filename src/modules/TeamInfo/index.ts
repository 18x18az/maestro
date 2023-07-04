import { PathComponent, TeamInfo } from '@18x18az/rosetta'
import { ModuleInstance, MultiModule } from '../../utils/module'
import { Request, Response } from 'express'
import { validate } from './validation'

class InstanceImplementation extends ModuleInstance<TeamInfo> {
  async broadcastData (data: TeamInfo): Promise<void> {
    console.log(data)
  }
}

export class TeamInfoModule extends MultiModule<InstanceImplementation> {
  protected createInstance (key: string): InstanceImplementation {
    return new InstanceImplementation(key)
  }

  private async handleTeams (req: Request, res: Response): Promise<void> {
    const teams = await validate(req, res)

    if (teams === undefined) {
      return
    }

    if (this.instances.size > 0) {
      res.status(409).send('team list already provided')
      return
    }

    const promises = teams.map(async (info, index) => {
      const team = this.register(index.toString())
      await team.setData(info)
    })

    await Promise.all(promises)

    res.status(200).send()
  }

  constructor () {
    super()
    this.handlePost(PathComponent.TEAM_INFO, this.handleTeams.bind(this))
  }
}
