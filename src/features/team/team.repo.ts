import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TeamEntity } from './team.entity'
import { Repository } from 'typeorm'
import { TeamCreate } from './team.object'
import { Checkin } from './team.interface'

@Injectable()
export class TeamRepo {
  constructor (@InjectRepository(TeamEntity) private readonly teamRepository: Repository<TeamEntity>) {}

  async getTeams (): Promise<TeamEntity[]> {
    return await this.teamRepository.find()
  }

  async addTeams (teams: TeamCreate[]): Promise<TeamEntity[]> {
    return await this.teamRepository.save(teams)
  }

  async removeTeams (teams: TeamCreate[]): Promise<void> {
    for (const team of teams) {
      await this.teamRepository.delete(team)
    }
  }

  async markCheckinStatus (teamId: number, status: Checkin): Promise<TeamEntity> {
    const team = await this.teamRepository.findOneByOrFail({ id: teamId })
    team.checkin = status
    return await this.teamRepository.save(team)
  }
}