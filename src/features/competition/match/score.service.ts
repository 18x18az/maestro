import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CalculableScore, StoredScore } from './score.interface'
import { AllianceScoreEdit } from './alliance-score.object'
import { Round, Winner } from './match.interface'
import { ScoreEdit } from './score.object'
import { calculateWinner, dehydrate, hydrate, makeCalculableScore, makeEmptyScore } from './score.calc'
import { InjectRepository } from '@nestjs/typeorm'
import { ScoreEntity } from './score.entity'
import { Repository } from 'typeorm'
import { MatchResultEvent, MatchResultPayload } from './match-result.event'
import { MatchRepo } from './match.repo'
import { TeamMetaEdit } from './team-meta.object'
import { ContestEntity } from './contest.entity'
import { ContestResultEvent } from './contest-result.event'

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name)
  private readonly workingScores = new Map<number, StoredScore>()

  constructor (
    @InjectRepository(ScoreEntity) private readonly repo: Repository<ScoreEntity>,
    private readonly resultEvent: MatchResultEvent,
    private readonly contestResultEvent: ContestResultEvent,
    private readonly matchRepo: MatchRepo
  ) {
    resultEvent.registerAfter(this.onMatchResult.bind(this))
  }

  async onMatchResult (data: MatchResultPayload): Promise<void> {
    const contest = await this.matchRepo.getContestByMatch(data.matchId)
    const winner = await this.getContestWinner(contest)

    if (winner === Winner.NONE) return

    await this.contestResultEvent.execute({ contest, winner })
  }

  async getScore (matchId: number): Promise<StoredScore> {
    const existing = this.workingScores.get(matchId)

    if (existing !== undefined) {
      return existing
    }

    const stored = await this.getSavedScore(matchId)

    if (stored !== null) {
      this.logger.log(`Using saved score for match ${matchId}`)
      this.workingScores.set(matchId, stored)
      return stored
    }

    this.logger.log(`Creating new working score for match ${matchId}`)

    const isElim = false

    const { redTeams, blueTeams } = await this.matchRepo.getMatchTeams(matchId)

    if (redTeams === undefined || blueTeams === undefined) throw new BadRequestException('Match has no teams')

    const score = makeEmptyScore(matchId, isElim, redTeams, blueTeams)

    this.workingScores.set(matchId, score)
    return score
  }

  async saveScore (matchId: number): Promise<void> {
    const score = await this.getScore(matchId)

    score.changed = false
    this.workingScores.set(matchId, score)

    if (!score.locked) throw new BadRequestException('Score must be locked before saving')

    const string = dehydrate(score)
    const savedAt = new Date()
    this.logger.log(`Saving score for match ${matchId}`)
    await this.repo.save({ matchId, score: string, savedAt })
    await this.resultEvent.execute({ matchId })
  }

  async getSavedScore (matchId: number): Promise<CalculableScore | null> {
    const saved = await this.repo.findOne({ where: { matchId }, order: { savedAt: 'DESC' } })

    if (saved === null) return null

    const score = hydrate(saved.score)
    score.savedAt = saved.savedAt
    score.locked = true
    score.changed = false
    score.hidden = score.isElim

    return makeCalculableScore(score)
  }

  async getSavedScores (matchId: number): Promise<CalculableScore[]> {
    const saved = await this.repo.find({ where: { matchId }, order: { savedAt: 'ASC' } })

    return saved.map((s) => {
      const score = hydrate(s.score)
      score.savedAt = s.savedAt
      score.hidden = score.isElim
      return makeCalculableScore(score)
    })
  }

  async getContestWinner (contest: ContestEntity): Promise<Winner> {
    const round = contest.round

    const matches = await this.matchRepo.getMatchesByContest(contest.id)

    if (matches.length === 0) return Winner.NONE

    const winners = await Promise.all(matches.map(async (m) => await this.getWinner(m.id)))

    if (round === Round.QUAL) {
      return winners[0]
    }

    if (round !== Round.F) {
      const result = winners[winners.length - 1]

      if (result === Winner.BLUE || result === Winner.RED) return result

      return Winner.NONE
    }

    // TODO eventually we'll need to handle normal non championship events
    const redWins = winners.filter((w) => w === Winner.RED).length >= 2

    if (redWins) return Winner.RED

    const blueWins = winners.filter((w) => w === Winner.BLUE).length >= 2

    if (blueWins) return Winner.BLUE

    return Winner.NONE
  }

  async getWinner (matchId: number): Promise<Winner> {
    const score = await this.getSavedScore(matchId)

    if (score === null) return Winner.NONE

    return calculateWinner(score)
  }

  async getCalculableScore (matchId: number): Promise<CalculableScore> {
    return makeCalculableScore(await this.getScore(matchId))
  }

  async updateScore (matchId: number, edit: ScoreEdit): Promise<CalculableScore> {
    const score = await this.getCalculableScore(matchId)
    const updated = { ...score, ...edit }
    updated.changed = true
    this.workingScores.set(matchId, updated)
    return makeCalculableScore(updated)
  }

  async updateAllianceScore (matchId: number, color: string, edit: AllianceScoreEdit): Promise<CalculableScore> {
    const score = await this.getCalculableScore(matchId)

    const partToEdit = score[color]
    const edited = { ...partToEdit, ...edit }
    score[color] = edited
    score.changed = true
    this.workingScores.set(matchId, score)

    return makeCalculableScore(score)
  }

  async updateTeamMeta (matchId: number, teamId: number, edit: TeamMetaEdit): Promise<CalculableScore> {
    const score = await this.getCalculableScore(matchId)

    const color = score.red.teams.some((t) => t.teamId === teamId) ? 'red' : 'blue'
    const team = score[color].teams.find((t) => t.teamId === teamId)

    if (team === undefined) throw new BadRequestException('Team not found')

    const edited = { ...team, ...edit }
    score[color].teams = score[color].teams.map((t) => (t.teamId === teamId ? edited : t))
    score.changed = true

    this.workingScores.set(matchId, score)

    return makeCalculableScore(score)
  }
}
