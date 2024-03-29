import { Injectable, Logger } from '@nestjs/common'
import { Alliance } from '../../alliance-selection/alliance-selection.interfaces'
import { InjectRepository } from '@nestjs/typeorm'
import { AllianceEntity } from './alliance.entity'
import { IsNull, Not, Repository } from 'typeorm'
import { StageChangeEvent } from '../../stage/stage-change.event'
import { EventStage } from '../../stage/stage.interface'
import { Round, Winner } from './match.interface'
import { MatchRepo } from './match.repo'
import { MatchResultEvent, MatchResultPayload } from './match-result.event'
import { ScoreService } from './score.service'

function getNextRound (round: Round): Round | null {
  switch (round) {
    case Round.Ro16:
      return Round.QF
    case Round.QF:
      return Round.SF
    case Round.SF:
      return Round.F
    case Round.F:
      return null
    default:
      throw new Error('Invalid round')
  }
}

@Injectable()
export class ElimsService {
  private readonly logger: Logger = new Logger(ElimsService.name)
  constructor (
    @InjectRepository(AllianceEntity) private readonly allianceRepo: Repository<AllianceEntity>,
    private readonly stageChange: StageChangeEvent,
    private readonly matchRepo: MatchRepo,
    private readonly matchResultEvent: MatchResultEvent,
    private readonly score: ScoreService
  ) {
    this.stageChange.registerAfter(async data => {
      if (data.stage === EventStage.ELIMS) {
        await this.createElims()
      }
    })
    this.matchResultEvent.registerOnComplete(this.onMatchResult.bind(this))
  }

  async onMatchResult (data: MatchResultPayload): Promise<void> {
    const contest = await this.matchRepo.getContestByMatch(data.matchId)
    const round = contest.round

    if (round === Round.QUAL) return

    const winner = await this.score.getContestWinner(contest)

    if (winner === Winner.NONE) {
      this.logger.log(`Creating new match for ${round} contest ${contest.number}`)
      await this.matchRepo.addContestMatch(contest)
      return
    }

    if (winner === Winner.RED || winner === Winner.BLUE) {
      this.logger.log(`Advancing ${winner} alliance of ${round} contest ${contest.number} to next round`)
      const winningId = winner === Winner.RED ? contest.redAllianceId : contest.blueAllianceId
      if (winningId === null) throw new Error('Winner is null')

      const winningAlliance = await this.allianceRepo.findOneOrFail({ where: { id: winningId } })
      const nextRound = getNextRound(round)

      if (nextRound === null) return

      const nextContestNumber = Math.ceil(contest.number / 2)
      const alliance = contest.number % 2 === 1 ? 'red' : 'blue'

      await this.matchRepo.assignAllianceToContest(winningAlliance, nextRound, nextContestNumber, alliance)
    }
  }

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

  private async createContest (round: Round, contest: number): Promise<void> {
    this.logger.log(`Creating ${round} contest ${contest}`)
    await this.matchRepo.createElimsContest(round, contest)
  }

  private async assignToContest (alliance: AllianceEntity, round: Round, contest: number, color: 'red' | 'blue'): Promise<void> {
    this.logger.log(`Assigning alliance ${alliance.elimRank} to ${round} contest ${contest} as ${color}`)
    await this.matchRepo.assignAllianceToContest(alliance, round, contest, color)
  }

  private async createRo16Contest (red: AllianceEntity, blue: AllianceEntity, contest: number): Promise<void> {
    await this.createContest(Round.Ro16, contest)
    await this.assignToContest(red, Round.Ro16, contest, 'red')
    await this.assignToContest(blue, Round.Ro16, contest, 'blue')
  }

  private async createElims (): Promise<void> {
    this.logger.log('Generating elimination matches')
    // get all alliances with an elim rank sorted by elim rank
    const alliances = await this.allianceRepo.find({ where: { elimRank: Not(IsNull()) }, order: { elimRank: 'ASC' } })

    const numAlliances = alliances.length

    const contestTable = [
      1,
      8,
      4,
      5,
      2,
      7,
      3,
      6
    ]

    this.logger.log('Creating Ro16 contests')

    let contestNumber = 0
    for (const team1Rank of contestTable) {
      contestNumber++
      const team1Index = team1Rank - 1
      const team2Index = 15 - team1Index

      if (team2Index >= numAlliances) continue

      await this.createRo16Contest(alliances[team1Index], alliances[team2Index], contestNumber)
    }

    this.logger.log('Creating QF, SF, and F contests')

    for (let i = 1; i <= 4; i++) {
      await this.createContest(Round.QF, i)
    }

    for (let i = 1; i <= 2; i++) {
      await this.createContest(Round.SF, i)
    }

    await this.createContest(Round.F, 1)

    this.logger.log('Advancing bys to QF contests')

    contestNumber = 0
    for (const team1Rank of contestTable) {
      contestNumber++
      const team1Index = team1Rank - 1
      const team2Index = 15 - team1Index

      if (team2Index < numAlliances) continue
      const qfMatchNumber = Math.ceil(contestNumber / 2)

      const color = team1Index >= 4 ? 'blue' : 'red'

      await this.assignToContest(alliances[team1Index], Round.QF, qfMatchNumber, color)
    }
  }
}
