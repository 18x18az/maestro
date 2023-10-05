import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import {
  AUTON_WINNER,
  FullMatchScoreInMemory,
  MatchScoreInMemory,
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

  private async createEmptyMatchScore (...matchIds: number[]): Promise<void> {
    this.cache.createMany(
      matchIds.map((id) => {
        return { id: id.toString(), locked: false, redScore: {}, blueScore: {} }
      })
    )
  }

  private readonly logger = new Logger(MatchScoreDatabase.name)
  // copy all scores into memoryDB and lock them
  async onApplicationBootstrap (): Promise<void> {
    await this.createEmptyMatchScore(
      ...Array(100)
        .fill(0)
        .map((e, i) => i)
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
      const key: keyof RecursivePartialMatchScore = forLoopKey as keyof RecursivePartialMatchScore
      const value = partialScore[key]
      switch (key) {
        case 'redScore':
        case 'blueScore':
          if (memScore[key] === undefined) memScore[key] = {}
          // look at that lodash thing: https://www.geeksforgeeks.org/lodash-_-merge-method/
          memScore[key] = { ...memScore[key], ...partialScore[key] }
          break
        case 'locked':
          if (typeof value === 'boolean') memScore.locked = value
          else {
            // throw error probably?
          }
          break
        case 'autonWinner':
          // @Todo better check if prop is AUTON_WINNER
          if (typeof value === 'string') {
            memScore.autonWinner = value
          } else {
            // throw error
          }
          break
        // ts-standard error that I cant be bothered to deal with:
        // Unexpected lexical declaration in case block. (no-case-declarations)

        // default:
        //   const _exhaustiveCheck: never = key
        //   return _exhaustiveCheck
      }
    }
    this.cache.update(memScore)
  }

  async saveScore (matchId: number): Promise<void> {
    const fullMemScore = plainToClass(FullMatchScoreInMemory, this.getWorkingScore(matchId))
    // used to validate completeness of fullMemScore
    await validateOrReject(fullMemScore, {
      whitelist: true,
      forbidUnknownValues: true
    })
    const score: Partial<MatchScoreInPrismaCreationData> = {}
    for (const forLoopKey in fullMemScore) {
      const key: keyof MatchScoreInMemory = forLoopKey as keyof MatchScoreInMemory
      const value = fullMemScore[key]
      switch (key) {
        case 'redScore':
        case 'blueScore':
          score[key] = JSON.stringify(value)
          break
        case 'autonWinner':
          if (value !== undefined) score.autonWinner = value as AUTON_WINNER
          break
        case 'locked':
          break
        case 'id':
          score.matchId = Number(value)
          break
        // ts-standard error that I cant be bothered to deal with:
        // Unexpected lexical declaration in case block. (no-case-declarations)
        // default:
        //   const _exhaustiveCheck: never = key
        //   return _exhaustiveCheck
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
