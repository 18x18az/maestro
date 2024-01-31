import { Injectable, Logger } from '@nestjs/common'
import { TmService } from '../../utils/tm/tm.service'
import { TmConnectedEvent } from '../../utils/tm/tm-connected.event'
import { InjectRepository } from '@nestjs/typeorm'
import { AwardEntity } from './award.entity'
import { Repository } from 'typeorm'
import { TeamService } from '../team/team.service'
import { TeamEntity } from '../team/team.entity'

@Injectable()
export class AwardService {
  constructor (
    private readonly tm: TmService,
    private readonly tmConnected: TmConnectedEvent,
    @InjectRepository(AwardEntity) private readonly awardRepository: Repository<AwardEntity>,
    private readonly teams: TeamService
  ) {}

  private readonly logger = new Logger(AwardService.name)

  onModuleInit (): void {
    this.tmConnected.registerOnComplete(this.updateAwards.bind(this))
  }

  async updateAwards (): Promise<void> {
    const awards = await this.tm.getAwards()

    if (awards === null) return

    const updates = awards.map(async award => {
      let stored = await this.awardRepository.findOne({ where: { name: award.name }, relations: ['winners'] })

      if (stored === null) {
        this.logger.log(`Creating award ${award.name}`)
        stored = new AwardEntity()
        stored.name = award.name
        await this.awardRepository.save(stored)
      }

      const storedWinners = stored.winners

      const winnersToAdd = await Promise.all(award.winners.flatMap(async winner => {
        const match = storedWinners.find(w => w.name === winner)

        if (match !== undefined) {
          return []
        } else {
          return await this.teams.getTeamByNumber(winner)
        }
      }))

      if (winnersToAdd.length === 0) return

      this.logger.log(`Adding winners to award ${award.name}`)

      stored.winners = winnersToAdd.flat()
      await this.awardRepository.save(stored)
    })

    await Promise.all(updates)
  }

  async getAwards (): Promise<AwardEntity[]> {
    return await this.awardRepository.find()
  }

  async getWinners (award: AwardEntity): Promise<TeamEntity[] | null> {
    const stored = await this.awardRepository.findOneOrFail({ where: { id: award.id }, relations: ['winners'] })
    const winners = stored.winners

    if (winners.length === 0) return null

    return winners
  }
}
