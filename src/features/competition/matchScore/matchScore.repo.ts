import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import {
  AUTON_WINNER,
  DefaultMatchScore,
  MatchDetails,
  MatchScore,
  MatchScoreInMemory,
  MatchScoreInPrisma,
  MatchScoreInPrismaCreationData,
  RecursivePartialMatchScore
} from './matchScore.interface'
import { validateOrReject } from 'class-validator'
import { plainToClass } from 'class-transformer'

@Injectable()
export class MatchScoreDatabase {
  constructor (
    private readonly prisma: PrismaService,
    private readonly cache: InMemoryDBService<MatchScoreInMemory>
  ) {}

  private static populateEmptyMatchScore (
    partialScore: Partial<MatchScoreInMemory> &
    Pick<MatchScoreInMemory, 'id' | 'round'>
  ): MatchScoreInMemory {
    const defaultScore = new DefaultMatchScore()
    return {
      ...partialScore,
      redScore: partialScore.redScore ?? defaultScore.redScore,
      blueScore: partialScore.blueScore ?? defaultScore.blueScore,
      autonWinner: partialScore.autonWinner ?? defaultScore.autonWinner,
      metadata: partialScore.metadata ?? defaultScore.metadata,
      locked: partialScore.locked ?? defaultScore.locked
    }
  }

  /** retrieves most recent match score with matchId */
  public async getFinalMatchScoreInPrisma (
    matchId: number
  ): Promise<MatchScoreInPrisma | null> {
    const savedScore: Omit<MatchScoreInPrisma, 'autonWinner'> & { autonWinner: string } | null = await this.prisma.matchScore.findFirst({
      where: { matchId },
      orderBy: { timeSaved: 'desc' }
    })
    if (savedScore === null) return null
    return plainToClass(MatchScoreInPrisma, savedScore)
  }

  /** retrieves most recent match score with matchId */
  async getFinalSavedMatchScore (matchId: number): Promise<MatchScore | null> {
    const prismaScore = await this.getFinalMatchScoreInPrisma(matchId)
    if (prismaScore === null) return null
    const parsedScore: Partial<MatchScore> = { locked: true }
    for (const forLoopKey in prismaScore) {
      const key: keyof MatchScoreInPrisma = forLoopKey as keyof MatchScoreInPrisma
      const value = prismaScore[key]
      switch (key) {
        case 'redScore':
        case 'blueScore':
        case 'metadata':
          if (typeof value === 'string') { parsedScore[key] = JSON.parse(value) }
          break
        case 'autonWinner':
          parsedScore[key] = prismaScore[key]
          break
        case 'matchId':
        case 'scoreId':
        case 'timeSaved':
          break
        default:{
          const _exhaustiveCheck: never = key
          return _exhaustiveCheck
        }
      }
    }
    return plainToClass(MatchScore, parsedScore)
  }

  public async hydrateInMemoryDB (matches: MatchDetails[]): Promise<void> {
    await Promise.all(
      matches.map(async ({ matchId, round }) => {
        this.cache.create(
          MatchScoreDatabase.populateEmptyMatchScore({
            ...(await this.getFinalSavedMatchScore(matchId) ?? {}),
            id: matchId.toString(),
            round
          })
        )
      })
    )
  }

  /** retrieves working score stored in memory */
  getWorkingScore (matchId: number): MatchScoreInMemory {
    const out = plainToClass(
      MatchScoreInMemory,
      this.cache.get(matchId.toString())
    )
    console.log(out)
    return out
  }

  getLockState (matchId: number): boolean {
    return this.getWorkingScore(matchId).locked
  }

  async updateScore (
    matchId: number,
    partialScore: RecursivePartialMatchScore
  ): Promise<void> {
    await validateOrReject(partialScore, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true
    })
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
    const memScore = plainToClass(
      MatchScoreInMemory,
      this.getWorkingScore(matchId)
    )
    // used to validate completeness of fullMemScore
    await validateOrReject(memScore, {
      whitelist: true,
      forbidUnknownValues: true
    })
    const score: Partial<MatchScoreInPrismaCreationData> = {}
    for (const forLoopKey in memScore) {
      const key: keyof MatchScoreInMemory =
        forLoopKey as keyof MatchScoreInMemory
      const value = memScore[key]
      switch (key) {
        case 'redScore':
        case 'blueScore':
        case 'metadata':
          score[key] = JSON.stringify(value)
          break
        case 'autonWinner':
          if (value !== undefined) score.autonWinner = value as AUTON_WINNER
          break
        case 'id':
          score.matchId = Number(value)
          break
        case 'locked':
        case 'round':
          break

        default: {
          const _exhaustiveCheck: never = key
          return _exhaustiveCheck
        }
      }
    }
    const checkableScore = plainToClass(MatchScoreInPrismaCreationData, score)
    await validateOrReject(checkableScore, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true
    })
    await this.prisma.matchScore.create({ data: checkableScore })
  }

  private async setLockState (
    matchId: number,
    lockState: boolean
  ): Promise<void> {
    await this.updateScore(
      matchId,
      plainToClass(RecursivePartialMatchScore, { locked: lockState })
    )
  }

  async lockScore (matchId: number): Promise<void> {
    await this.setLockState(matchId, true)
  }

  async unlockScore (matchId: number): Promise<void> {
    await this.setLockState(matchId, false)
  }
}
