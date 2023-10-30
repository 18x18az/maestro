import { Injectable } from '@nestjs/common'
import { PublishService } from '../publish'
import { TeamInformation, TeamsTopic } from './tm.interface'

@Injectable()
export class TmPublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishTeams (teams: TeamInformation[]): Promise<void> {
    await this.publisher.broadcast(TeamsTopic, { teams })
  }
}
