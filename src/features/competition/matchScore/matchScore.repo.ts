import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import {
  AUTON_WINNER,
  ELEVATION,
  MATCH_ROUND,
  MatchIdentifiers,
  MatchScore,
  MatchScoreInMemory,
  MatchScoreFromPrisma,
  QUAL_TEAM_METADATA,
  RecursivePartialMatchScore,
  MatchScoreInPrisma,
  MatchDetails,
  MatchScoreFromPrismaWithDetails
} from './matchScore.interface'

@Injectable()
export class MatchScoreDatabase {
  constructor (
    private readonly prisma: PrismaService,
    private readonly cache: InMemoryDBService<MatchScoreInMemory>
  ) {}

  private static populateEmptyMatchScore (
    params: { round: MATCH_ROUND, id: string } & MatchDetails): MatchScoreInMemory {
    const baseScore = {
      redScore: {
        goalTriballs: 0,
        zoneTriballs: 0,
        allianceTriballsInGoal: 0,
        allianceTriballsInZone: 0,
        robot1Tier: ELEVATION.NONE,
        robot2Tier: ELEVATION.NONE
      },
      blueScore: {
        goalTriballs: 0,
        zoneTriballs: 0,
        allianceTriballsInGoal: 0,
        allianceTriballsInZone: 0,
        robot1Tier: ELEVATION.NONE,
        robot2Tier: ELEVATION.NONE
      },
      autonWinner: AUTON_WINNER.NONE,
      locked: false
    }
    const elimMetadata: Extract<MatchScoreInMemory, { round: MATCH_ROUND.ELIMINATION }>['metadata'] = {
      red: { disqualified: false },
      blue: { disqualified: false }
    }
    const qualMetadata: Extract<MatchScoreInMemory, { round: MATCH_ROUND.QUALIFICATION }>['metadata'] = {
      red: {
        team1: QUAL_TEAM_METADATA.NONE,
        team2: QUAL_TEAM_METADATA.NONE,
        autonWinPoint: false
      },
      blue: {
        team1: QUAL_TEAM_METADATA.NONE,
        team2: QUAL_TEAM_METADATA.NONE,
        autonWinPoint: false
      }
    }
    const metadata = params.round === MATCH_ROUND.ELIMINATION ? elimMetadata : qualMetadata
    const additional: MatchDetails & Omit<MatchIdentifiers, 'matchId'> & { id: string } = params
    const out = { metadata, ...additional, ...baseScore }
    return out as MatchScoreInMemory
  }

  /** retrieves most recent match score with matchId */
  public async getFinalMatchScoreFromPrisma (
    matchId: number
  ): Promise<MatchScoreFromPrisma | null> {
    const rawSavedScore: MatchScoreInPrisma | null = await this.prisma.matchScore.findFirst({
      where: { matchId },
      orderBy: { timeSaved: 'desc' }
    })
    if (rawSavedScore === null) return null
    const savedScore: MatchScoreFromPrisma = {
      ...rawSavedScore,
      redScore: JSON.parse(rawSavedScore.redScore),
      blueScore: JSON.parse(rawSavedScore.blueScore),
      metadata: JSON.parse(rawSavedScore.metadata),
      autonWinner: rawSavedScore.autonWinner as AUTON_WINNER
    }
    return savedScore
  }

  /** retrieves most recent match score with matchId */
  public async getFinalMatchScoreFromPrismaWithDetails (
    matchId: number
  ): Promise<MatchScoreFromPrismaWithDetails | null> {
    const prismaScore = await this.getFinalMatchScoreFromPrisma(matchId)
    const cachedScore = this.getWorkingScore(matchId)
    if (prismaScore === null || cachedScore === null) return null
    const scoreWithDetails: MatchScoreFromPrismaWithDetails = {
      ...prismaScore,
      red: cachedScore.red,
      blue: cachedScore.blue,
      number: cachedScore.number
    }
    return scoreWithDetails
  }

  /** retrieves most recent match score with matchId */
  async getFinalSavedMatchScore (matchId: number): Promise<MatchScore | null> {
    const prismaScore = await this.getFinalMatchScoreFromPrisma(matchId)
    if (prismaScore === null) return null
    const parsedScore = {
      locked: true,
      redScore: prismaScore.redScore,
      blueScore: prismaScore.blueScore,
      metadata: prismaScore.metadata,
      autonWinner: prismaScore.autonWinner
    }
    return parsedScore as MatchScore
  }

  public async hydrateInMemoryDB (matches: Array<MatchIdentifiers & MatchDetails>): Promise<void> {
    await Promise.all(
      matches.map(async <R extends MATCH_ROUND>(details: MatchIdentifiers & MatchDetails & { round: R }) => {
        const savedScore = await this.getFinalSavedMatchScore(details.matchId)
        const params = { ...details, id: details.matchId.toString() }
        let data: MatchScoreInMemory
        if (savedScore === null) data = MatchScoreDatabase.populateEmptyMatchScore(params)
        else data = { ...savedScore as Extract<typeof savedScore, Extract<MatchScoreInMemory, { round: R } >>, ...params }
        await this.cache.create(data)
      })
    )
  }

  /** retrieves working score stored in memory */
  getWorkingScore (matchId: number): MatchScoreInMemory {
    return this.cache.get(matchId.toString())
  }

  getLockState (matchId: number): boolean {
    return this.getWorkingScore(matchId).locked
  }

  async updateScore (
    matchId: number,
    partialScore: RecursivePartialMatchScore
  ): Promise<void> {
    const memScore = this.getWorkingScore(matchId)
    for (const forLoopKey in partialScore) {
      const key: keyof RecursivePartialMatchScore =
        forLoopKey as keyof RecursivePartialMatchScore
      const value = partialScore[key]
      switch (key) {
        case 'redScore':
        case 'blueScore':
          // look at that lodash thing: https://www.geeksforgeeks.org/lodash-_-merge-method/
          memScore[key] = { ...memScore[key], ...partialScore[key] }
          break
        case 'locked':
          if (typeof value === 'boolean') { memScore.locked = value }
          break
        case 'autonWinner':
          if (typeof value === 'string') { memScore.autonWinner = value }

          break
        case 'metadata': {
          const metadata = partialScore.metadata
          if (metadata == null || typeof metadata !== 'object') break
          if (
            memScore.metadata == null ||
            typeof memScore.metadata !== 'object'
          ) break

          if ('red' in metadata) {
            memScore.metadata.red = {
              ...memScore.metadata.red,
              ...metadata.red
            }
          }

          if ('blue' in metadata) {
            memScore.metadata.blue = {
              ...memScore.metadata.blue,
              ...metadata.blue
            }
          }
        }
          break

        default: {
          const _exhaustiveCheck: never = key
          return _exhaustiveCheck
        }
      }
    }
    this.cache.update(memScore)
  }

  async saveScore (matchId: number): Promise<void> {
    const memScore = this.getWorkingScore(matchId)

    // used to validate completeness of fullMemScore
    const score = {
      redScore: JSON.stringify(memScore.redScore),
      blueScore: JSON.stringify(memScore.blueScore),
      metadata: JSON.stringify(memScore.metadata),
      autonWinner: memScore.autonWinner,
      matchId: Number(memScore.id)
    }
    await this.prisma.matchScore.create({ data: score })
  }

  private async setLockState (
    matchId: number,
    lockState: boolean
  ): Promise<void> {
    await this.updateScore(
      matchId,
      { locked: lockState }
    )
  }

  async lockScore (matchId: number): Promise<void> {
    await this.setLockState(matchId, true)
  }

  async unlockScore (matchId: number): Promise<void> {
    await this.setLockState(matchId, false)
  }
}
