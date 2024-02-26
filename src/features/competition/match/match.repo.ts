import { BadRequestException, Injectable, Logger } from '@nestjs/common'
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
import { MatchIdentifier } from '../../../utils/tm/tm.interface'
import { AllianceEntity } from './alliance.entity'

@Injectable()
export class MatchRepo {
  private readonly logger = new Logger(MatchRepo.name)

  constructor (
    @InjectRepository(MatchEntity) private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(SittingEntity) private readonly sittingRepository: Repository<SittingEntity>,
    @InjectRepository(ContestEntity) private readonly contestRepository: Repository<ContestEntity>,
    @InjectRepository(BlockEntity) private readonly blockRepository: Repository<BlockEntity>,
    @InjectRepository(AllianceEntity) private readonly allianceRepository: Repository<AllianceEntity>,
    private readonly resetEvent: EventResetEvent
  ) {
    this.resetEvent.registerBefore(this.reset.bind(this))
  }

  async getMatchTeams (match: number): Promise<{ redTeams: number[], blueTeams: number[] }> {
    const m = await this.matchRepository.findOneOrFail({ relations: { contest: { redAlliance: true, blueAlliance: true } }, where: { id: match } })
    const redTeams = m.contest.redAlliance.team2Id !== undefined ? [m.contest.redAlliance.team1Id, m.contest.redAlliance.team2Id] : [m.contest.redAlliance.team1Id]
    const blueTeams = m.contest.blueAlliance.team2Id !== undefined ? [m.contest.blueAlliance.team1Id, m.contest.blueAlliance.team2Id] : [m.contest.blueAlliance.team1Id]

    return { redTeams, blueTeams }
  }

  async reset (): Promise<void> {
    this.logger.log('Resetting matches')
    await this.blockRepository.clear()
    await this.contestRepository.clear()
    await this.matchRepository.clear()
    await this.sittingRepository.clear()
  }

  async updateSittingStatus (sitting: number, status: SittingStatus): Promise<void> {
    await this.sittingRepository.update(sitting, { status })
  }

  private async createAlliance (teams: TeamEntity[]): Promise<AllianceEntity> {
    const alliance = new AllianceEntity()
    alliance.team1 = teams[0]
    if (teams.length > 1) alliance.team2 = teams[1]
    return await this.allianceRepository.save(alliance)
  }

  private async createQualMatch (block: BlockEntity, data: CreateQualMatch): Promise<void> {
    const contest = new ContestEntity()
    contest.round = Round.QUAL
    contest.number = data.number
    contest.redAlliance = await this.createAlliance(data.redTeams)
    contest.blueAlliance = await this.createAlliance(data.blueTeams)
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

  async getElimsBlock (): Promise<BlockEntity> {
    let block = await this.blockRepository.findOne({ where: { name: 'Eliminations' } })
    if (block === null) {
      block = new BlockEntity()
      block.name = 'Eliminations'
      await this.blockRepository.save(block)
    }
    return block
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

  async getSitting (id: number): Promise<SittingEntity> {
    return await this.sittingRepository.findOneByOrFail({ id })
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
    const c = await this.contestRepository.findOneOrFail({ relations: { redAlliance: { team1: true, team2: true } }, where: { id: contest } })
    const teams = c.redAlliance.team2 !== undefined ? [c.redAlliance.team1, c.redAlliance.team2] : [c.redAlliance.team1]
    return teams
  }

  async getBlueTeams (contest: number): Promise<TeamEntity[]> {
    const c = await this.contestRepository.findOneOrFail({ relations: { blueAlliance: { team1: true, team2: true } }, where: { id: contest } })
    const teams = c.blueAlliance.team2 !== undefined ? [c.blueAlliance.team1, c.blueAlliance.team2] : [c.blueAlliance.team1]
    return teams
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

  async canConcludeBlock (block: number): Promise<boolean> {
    const sittings = await this.sittingRepository.find({ where: { blockId: block } })

    for (const sitting of sittings) {
      if (sitting.status !== SittingStatus.COMPLETE) return false
    }

    return true
  }

  async markBlockStatus (block: number, status: BlockStatus): Promise<void> {
    await this.blockRepository.update(block, { status })
  }

  async getMatchScore (match: MatchIdentifier): Promise<{ redScore: number, blueScore: number } | null> {
    const contest = await this.contestRepository.findOne({ where: { round: match.round, number: match.contest } })

    if (contest === null) {
      this.logger.warn(`Could not find contest ${match.round}-${match.contest}`)
      return null
    }

    const matchEntity = await this.matchRepository.findOne({ where: { contestId: contest.id, number: match.match } })

    if (matchEntity === null) {
      this.logger.warn(`Could not find match ${match.round}-${match.contest}-${match.match}`)
      return null
    }

    if (matchEntity.redScore === null || matchEntity.blueScore === null) {
      return null
    }

    return matchEntity
  }

  async getMatchId (match: MatchIdentifier): Promise<number> {
    const contest = await this.contestRepository.findOne({ where: { round: match.round, number: match.contest } })

    if (contest === null) throw new BadRequestException(`Could not find contest ${match.round}-${match.contest}`)

    const matchEntity = await this.matchRepository.findOne({ where: { contestId: contest.id, number: match.match } })

    if (matchEntity === null) throw new BadRequestException(`Could not find match ${match.round}-${match.contest}-${match.match}`)

    return matchEntity.id
  }

  async updateMatchScore (match: number, redScore: number, blueScore: number): Promise<void> {
    await this.matchRepository.update(match, { redScore, blueScore })
  }

  async getPendingSitting (matchId: number): Promise<number | null> {
    const pendingSitting = await this.sittingRepository.findOne({ where: { matchId, status: SittingStatus.SCORING } })

    if (pendingSitting === null) return null

    return pendingSitting.id
  }

  async replaySitting (sitting: number): Promise<void> {
    const sittingEntity = await this.sittingRepository.findOne({ where: { id: sitting } })
    if (sittingEntity === null) throw new Error('Sitting not found')
    sittingEntity.status = SittingStatus.COMPLETE
    const nextSittingNumber = sittingEntity.number + 1

    const newSitting = new SittingEntity()
    newSitting.blockId = sittingEntity.blockId
    newSitting.number = nextSittingNumber
    newSitting.matchId = sittingEntity.matchId
    await this.sittingRepository.save(newSitting)
    await this.sittingRepository.save(sittingEntity)
  }

  async getNextSitting (fieldId: number): Promise<number | null> {
    const currentBlock = await this.getCurrentBlock()

    if (currentBlock === null) return null

    const blockId = currentBlock.id

    const sitting = await this.sittingRepository.findOne({ where: { fieldId, status: SittingStatus.NOT_STARTED, blockId } })

    if (sitting !== null) return sitting.id

    const replaySitting = await this.sittingRepository.findOne({ where: { fieldId: undefined, status: SittingStatus.NOT_STARTED, blockId } })

    if (replaySitting !== null) return replaySitting.id

    return null
  }

  async getContestByMatch (match: number): Promise<ContestEntity> {
    const matchEntity = await this.matchRepository.findOneOrFail({ relations: ['contest'], where: { id: match } })
    return matchEntity.contest
  }

  async getMatchByIdentifier (match: MatchIdentifier): Promise<MatchEntity | null> {
    const contest = await this.contestRepository.findOne({ where: { round: match.round, number: match.contest } })

    if (contest === null) {
      return null
    }

    const matchEntity = await this.matchRepository.findOne({ where: { contestId: contest.id, number: match.match } })

    if (matchEntity === null) {
      this.logger.warn(`Could not find match ${match.round}-${match.contest}-${match.match}`)
      return null
    }

    return matchEntity
  }

  async createElimsMatch (match: MatchIdentifier, red: TeamEntity[], blue: TeamEntity[]): Promise<void> {
    let contest = await this.contestRepository.findOne({ where: { round: match.round, number: match.contest } })

    if (contest === null) {
      contest = new ContestEntity()
      contest.round = match.round
      contest.number = match.contest
      // contest.redTeams = red
      // contest.blueTeams = blue
      await this.contestRepository.save(contest)
    }

    const matchEntity = new MatchEntity()
    matchEntity.contest = contest
    matchEntity.number = match.match
    await this.matchRepository.save(matchEntity)

    const sitting = new SittingEntity()
    sitting.match = matchEntity

    const block = await this.getElimsBlock()
    sitting.block = block
    await this.sittingRepository.save(sitting)
  }
}
