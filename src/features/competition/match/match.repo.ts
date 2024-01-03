import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateQualMatch, MatchEntity } from './match.entity'
import { Repository } from 'typeorm'
import { BlockStatus, Round, SittingStatus } from './match.interface'
import { ContestEntity } from './contest.entity'
import { BlockEntity, CreateQualBlock } from './block.entity'
import { SittingEntity } from './sitting.entity'
import { EventResetEvent } from '../../stage/event-reset.event'
import { TeamEntity } from '../../team/team.entity'
import { FieldEntity } from '../../field/field.entity'

@Injectable()
export class MatchRepo {
  private readonly logger = new Logger(MatchRepo.name)

  constructor (
    @InjectRepository(MatchEntity) private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(SittingEntity) private readonly sittingRepository: Repository<SittingEntity>,
    @InjectRepository(ContestEntity) private readonly contestRepository: Repository<ContestEntity>,
    @InjectRepository(BlockEntity) private readonly blockRepository: Repository<BlockEntity>,
    private readonly resetEvent: EventResetEvent
  ) {
    this.resetEvent.registerBefore(this.reset.bind(this))
  }

  async reset (): Promise<void> {
    this.logger.log('Resetting matches')
    await this.blockRepository.clear()
    await this.contestRepository.clear()
    await this.matchRepository.clear()
    await this.sittingRepository.clear()
  }

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

  async getBlock (id: number): Promise<BlockEntity> {
    return await this.blockRepository.findOneByOrFail({ id })
  }

  async getBlocks (): Promise<BlockEntity[]> {
    return await this.blockRepository.find()
  }

  async getCurrentBlock (): Promise<BlockEntity | null> {
    return await this.blockRepository.findOne({ where: { status: BlockStatus.IN_PROGRESS } })
  }

  async getNextBlock (): Promise<BlockEntity | null> {
    return await this.blockRepository.findOne({ where: { status: BlockStatus.NOT_STARTED }, order: { id: 'ASC' } })
  }

  async getContests (): Promise<ContestEntity[]> {
    return await this.contestRepository.find()
  }

  async getContest (id: number): Promise<ContestEntity> {
    return await this.contestRepository.findOneByOrFail({ id })
  }

  async getMatches (): Promise<MatchEntity[]> {
    return await this.matchRepository.find()
  }

  async getMatchesByContest (contest: number): Promise<MatchEntity[]> {
    return await this.matchRepository.find({ where: { contestId: contest } })
  }

  async getMatch (id: number): Promise<MatchEntity> {
    return await this.matchRepository.findOneByOrFail({ id })
  }

  async getSittings (): Promise<SittingEntity[]> {
    return await this.sittingRepository.find()
  }

  async getSittingsByMatch (match: number): Promise<SittingEntity[]> {
    return await this.sittingRepository.find({ where: { matchId: match } })
  }

  async getSittingsByBlock (block: number): Promise<SittingEntity[]> {
    return await this.sittingRepository.find({ where: { blockId: block } })
  }

  async getUnqueuedSittingsByBlock (block: number): Promise<SittingEntity[]> {
    return await this.sittingRepository.find({ where: { blockId: block, status: SittingStatus.NOT_STARTED } })
  }

  async getRedTeams (contest: number): Promise<TeamEntity[]> {
    const c = await this.contestRepository.findOneOrFail({ relations: ['redTeams'], where: { id: contest } })
    return c.redTeams
  }

  async getBlueTeams (contest: number): Promise<TeamEntity[]> {
    const c = await this.contestRepository.findOneOrFail({ relations: ['blueTeams'], where: { id: contest } })
    return c.blueTeams
  }

  async getField (sitting: number): Promise<FieldEntity | null> {
    const s = await this.sittingRepository.findOneOrFail({ relations: ['field'], where: { id: sitting } })
    return s.field
  }

  async getBlockStartTime (block: number): Promise<Date | null> {
    // get the first sitting in the block sorted by time
    const sitting = await this.sittingRepository.findOne({ where: { blockId: block }, order: { scheduled: 'ASC' } })

    if (sitting === null) return null

    return sitting.scheduled
  }

  async getBlockEndTime (block: number): Promise<Date | null> {
    // get the last sitting in the block sorted by time
    const sitting = await this.sittingRepository.findOne({ where: { blockId: block }, order: { scheduled: 'DESC' } })

    if (sitting === null) return null

    return sitting.scheduled
  }

  async markBlockStatus (block: number, status: BlockStatus): Promise<void> {
    await this.blockRepository.update(block, { status })
  }
}
