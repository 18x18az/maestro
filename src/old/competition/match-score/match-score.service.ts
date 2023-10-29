import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { MatchScorePublisher } from './match-score.publisher'
import { SavedElimMatch, SavedQualMatch, SavedScoreDatabase } from './match-saved.repo'
import { WorkingScoreDatabase } from './match-working.repo'
import { createQualMatch, hydrateQualMatch } from './utils'
import { PublishedElimMatchScore, PublishedQualMatchScore } from './match-score.publsher.dto'
import { MATCH_ALLIANCE, MATCH_ROUND } from './local.dto'
import { GenericMatchParams, MatchScoreParams, SpecificPortionAllianceParams, SpecificPortionTeamParams } from './match-score.controller.dto'
import { AllianceRawUpdate } from './alliance-raw.dto'
import { AUTON_WINNER, MatchMetadataUpload } from './common-match.dto'
import { QualMatch } from '@/old/initial'

type GenericMatch = PublishedElimMatchScore | PublishedQualMatchScore

@Injectable()
export class MatchScoreService {
  constructor (
    private readonly publisher: MatchScorePublisher,
    private readonly saved: SavedScoreDatabase,
    private readonly working: WorkingScoreDatabase
  ) {}

  private readonly logger = new Logger(MatchScoreService.name)

  private async publishSavedScore (match: PublishedQualMatchScore): Promise<void> {
    await this.publisher.publishQualSavedScore(match)
  }

  private async updateWorkingQualScore (match: PublishedQualMatchScore, isSaveOperation = false): Promise<void> {
    match.saved = isSaveOperation
    this.working.saveQual(match)
    await this.publisher.publishQualWorkingScore(match)
  }

  private async updateWorkingElimScore (match: PublishedElimMatchScore, isSaveOperation = false): Promise<void> {
    match.saved = isSaveOperation
    this.working.saveElim(match)
    await this.publisher.publishElimWorkingScore(match)
  }

  private async updateWorkingMatchScore (params: { type: MATCH_ROUND }, score: GenericMatch, isSaveOperation = false): Promise<void> {
    if (params.type === MATCH_ROUND.QUALIFICATION) {
      await this.updateWorkingQualScore(score as PublishedQualMatchScore, isSaveOperation)
    } else {
      await this.updateWorkingElimScore(score as PublishedElimMatchScore, isSaveOperation)
    }
  }

  private async saveQual (match: PublishedQualMatchScore): Promise<void> {
    const savedData: SavedQualMatch = {
      redMetadata: {
        awp: match.red.autonWinPoint,
        team1: match.red[0],
        team2: match.red[1]
      },
      blueMetadata: {
        awp: match.blue.autonWinPoint,
        team1: match.blue[0],
        team2: match.blue[1]
      },
      matchId: parseInt(match.id),
      autonWinner: match.autonWinner,
      blueRaw: match.blueRaw,
      redRaw: match.redRaw,
      timeSaved: new Date()
    }

    await this.saved.saveMatch(savedData)
    await this.publisher.publishQualSavedScore(match)
  }

  private async saveElim (match: PublishedElimMatchScore): Promise<void> {
    const savedData: SavedElimMatch = {
      redMetadata: match.red.outcome,
      blueMetadata: match.blue.outcome,
      matchId: parseInt(match.id),
      autonWinner: match.autonWinner,
      blueRaw: match.blueRaw,
      redRaw: match.redRaw,
      timeSaved: new Date()
    }
    await this.saved.saveMatch(savedData)
    await this.publisher.publishElimSavedScore(match)
  }

  private async saveMatch (params: { type: MATCH_ROUND }, match: GenericMatch): Promise<void> {
    if (params.type === MATCH_ROUND.QUALIFICATION) {
      await this.saveQual(match as PublishedQualMatchScore)
    } else {
      await this.saveElim(match as PublishedElimMatchScore)
    }
  }

  async loadQualMatch (match: QualMatch): Promise<void> {
    const inDatabaseValue = await this.saved.getSavedQualMatch(match.id)

    if (inDatabaseValue === null) {
      const created = createQualMatch(match)
      await this.updateWorkingQualScore(created)
    } else {
      const hydrated = hydrateQualMatch(match, inDatabaseValue)
      await this.updateWorkingQualScore(hydrated)
      await this.publishSavedScore(hydrated)
    }
  }

  private getQualMatch (matchId: number, needsLocked = false): PublishedQualMatchScore {
    const match = this.working.getQual(matchId)

    if (match === null) {
      this.logger.warn(`Client attempted to access non-existent match ${matchId}`)
      throw new NotFoundException(`Qualification match ${matchId} not found`)
    }

    if (match.locked !== needsLocked) {
      this.logger.warn(`Client attempted to act on ${match.locked ? 'locked' : 'unlocked'} match ${matchId}`)
      throw new BadRequestException(`Qualification match ${matchId} is ${match.locked ? 'locked' : 'unlocked'}`)
    }

    return match
  }

  private getElimMatch (matchId: number, needsLocked = false): PublishedElimMatchScore {
    const match = this.working.getElim(matchId)

    if (match === null) {
      this.logger.warn(`Client attempted to access non-existent match ${matchId}`)
      throw new NotFoundException(`Elimination match ${matchId} not found`)
    }

    if (match.locked !== needsLocked) {
      this.logger.warn(`Client attempted to act on ${match.locked ? 'locked' : 'unlocked'} match ${matchId}`)
      throw new BadRequestException(`Elimination match ${matchId} is ${match.locked ? 'locked' : 'unlocked'}`)
    }

    return match
  }

  private getMatch (params: { type: MATCH_ROUND, matchId: number }, needsLocked = false): GenericMatch {
    if (params.type === MATCH_ROUND.QUALIFICATION) {
      return this.getQualMatch(params.matchId, needsLocked)
    } else {
      return this.getElimMatch(params.matchId, needsLocked)
    }
  }

  async handleReceiveQualMatchList (matches: QualMatch[]): Promise<void> {
    this.logger.log(`Handling ${matches.length} qualification matches`)
    const loadPromises = matches.map(async (match) => { await this.loadQualMatch(match) })
    await Promise.all(loadPromises)
  }

  async updateAllianceRawScore (params: MatchScoreParams, update: AllianceRawUpdate): Promise<void> {
    const match = this.getMatch(params)

    if (params.color === MATCH_ALLIANCE.RED) {
      match.redRaw = { ...match.redRaw, ...update }
    } else {
      match.blueRaw = { ...match.blueRaw, ...update }
    }

    await this.updateWorkingMatchScore(params, match)
  }

  async updateAutonOutcome (params: GenericMatchParams, autonWinner: AUTON_WINNER): Promise<void> {
    const match = this.getMatch(params)

    match.autonWinner = autonWinner

    await this.updateWorkingMatchScore(params, match)
  }

  async updateAllianceGotAwp (params: SpecificPortionAllianceParams, gotAwp: boolean): Promise<void> {
    const match = this.getQualMatch(params.matchId)

    if (params.color === MATCH_ALLIANCE.RED) {
      match.red.autonWinPoint = gotAwp
    } else {
      match.blue.autonWinPoint = gotAwp
    }

    await this.updateWorkingQualScore(match)
  }

  async updateTeamMeta (params: SpecificPortionTeamParams, meta: MatchMetadataUpload): Promise<void> {
    const match = this.getQualMatch(params.matchId)

    if (params.color === MATCH_ALLIANCE.RED) {
      const existing = match.red[params.teamNumber]
      meta = { ...existing, ...meta }
      match.red[params.teamNumber] = meta
    } else {
      const existing = match.blue[params.teamNumber]
      meta = { ...existing, ...meta }
      match.blue[params.teamNumber] = meta
    }

    await this.updateWorkingQualScore(match)
  }

  async updateAllianceMeta (params: SpecificPortionAllianceParams, meta: MatchMetadataUpload): Promise<void> {
    const match = this.getElimMatch(params.matchId)

    if (params.color === MATCH_ALLIANCE.RED) {
      match.red.outcome = meta.outcome
    } else {
      match.blue.outcome = meta.outcome
    }

    await this.updateWorkingElimScore(match)
  }

  async save (params: GenericMatchParams): Promise<void> {
    const match = this.getMatch(params, false)

    this.logger.log(`Saving match ${params.matchId}`)

    await this.updateWorkingMatchScore(params, match, true)

    await this.saveMatch(params, match)
  }

  async setLock (params: GenericMatchParams, state: boolean): Promise<void> {
    const match = this.getMatch(params, !state)

    match.locked = state

    await this.updateWorkingMatchScore(params, match)
  }
}
