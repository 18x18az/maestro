import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateQualMatch, MatchEntity } from './match.entity'
import { Repository } from 'typeorm'
import { Round, SittingStatus } from './match.interface'
import { ContestEntity } from './contest.entity'
import { BlockEntity, CreateQualBlock } from './block.entity'
import { SittingEntity } from './sitting.entity'

@Injectable()
export class MatchRepo {
  constructor (
    @InjectRepository(MatchEntity) private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(SittingEntity) private readonly sittingRepository: Repository<SittingEntity>,
    @InjectRepository(ContestEntity) private readonly contestRepository: Repository<ContestEntity>,
    @InjectRepository(BlockEntity) private readonly blockRepository: Repository<BlockEntity>
  ) {}

  async createElimsBlock (): Promise<number> {
    const block = await this.blockRepository.save(new BlockEntity())
    return block.id
  }

  async updateSittingStatus (match: number, status: SittingStatus): Promise<void> {
    // await this.matchRepository.update(match, { status })
  }

  private async createQualMatch (block: BlockEntity, data: CreateQualMatch): Promise<void> {
    const contest = new ContestEntity()
    contest.round = Round.QUAL
    contest.number = data.number
    contest.redTeams = data.redTeams
    contest.blueTeams = data.blueTeams
    await this.contestRepository.save(contest)

    const match = new MatchEntity()
    match.contest = contest
    await this.matchRepository.save(match)

    const sitting = new SittingEntity()
    sitting.block = block
    sitting.field = data.field
    sitting.scheduled = data.time
    sitting.match = match
    await this.sittingRepository.save(sitting)
  }

  async createQualBlock (data: CreateQualBlock): Promise<void> {
    const block = new BlockEntity()
    block.name = data.name
    await this.blockRepository.save(block)
    for (const match of data.matches) {
      await this.createQualMatch(block, match)
    }
  }

  async getBlocks (): Promise<BlockEntity[]> {
    return await this.blockRepository.find()
  }

  async getContests (): Promise<ContestEntity[]> {
    return await this.contestRepository.find()
  }

  async getMatches (): Promise<MatchEntity[]> {
    return await this.matchRepository.find()
  }

  async getSittings (): Promise<SittingEntity[]> {
    return await this.sittingRepository.find()
  }
}
