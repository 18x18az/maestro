import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from '../../../old_utils/publish/publish.service'
import { Team, TeamInfo } from './team.interface'

@Injectable()
export class TeamPublisher {
  constructor (private readonly publisher: PublishService) { }

  @Publisher('teams')
  async broadcastTeams (@Payload({ type: Team }) teams: TeamInfo): Promise<void> {
    await this.publisher.broadcast('teams', teams)
  }

  @Publisher('teamList')
  async broadcastTeamList (@Payload({ isArray: true, type: String }) teams: string[]): Promise<void> {
    await this.publisher.broadcast('teamList', teams)
  }
}
