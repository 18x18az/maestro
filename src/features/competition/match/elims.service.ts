import { Injectable } from '@nestjs/common'
import { Alliance } from '../../alliance-selection/alliance-selection.interfaces'
import { InjectRepository } from '@nestjs/typeorm'
import { AllianceEntity } from './alliance.entity'
import { Repository } from 'typeorm'

@Injectable()
export class ElimsService {
  constructor (@InjectRepository(AllianceEntity) private readonly allianceRepo: Repository<AllianceEntity>) {}

  async createAlliances (alliances: Alliance[]): Promise<void> {
    // create alliances in the database with elim rank as the index + 1
    for (let i = 0; i < alliances.length; i++) {
      const alliance = alliances[i]
      const allianceEntity = new AllianceEntity()
      allianceEntity.elimRank = i + 1
      allianceEntity.team1Id = alliance[0]
      allianceEntity.team2Id = alliance[1]
      await this.allianceRepo.save(allianceEntity)
    }
  }
}
