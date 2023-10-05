import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import {
  AUTON_WINNER,
  MatchScoreInMemory,
  MatchScoreInPrisma,
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
        return { id: id.toString(), locked: false }
      })
    )
  }

  private readonly logger = new Logger(MatchScoreDatabase.name)
  // copy all scores into memoryDB and lock them
  async onApplicationBootstrap (): Promise<void> {
    await this.createEmptyMatchScore(...Array(100).fill(0).map((e, i) => i))
  }

  /** retrieves working score stored in memory */
  getWorkingScore (matchId: number): MatchScoreInMemory {
    const out = plainToClass(MatchScoreInMemory, this.cache.get(matchId.toString()))
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
    for (const key in partialScore) {
      const prop = partialScore[key]
      switch (key) {
        case 'redScore':
        case 'blueScore':
          if (memScore[prop] === undefined) memScore[prop] = {}
          // look at that lodash thing: https://www.geeksforgeeks.org/lodash-_-merge-method/
          memScore[prop] = { ...memScore, ...partialScore }
          break
        case 'locked':
          if (typeof prop === 'boolean') memScore.locked = prop
          else {
            // throw error probably?
          }
          break
        case 'autonWinner':
          // @Todo better check if prop is AUTON_WINNER
          if (typeof prop === 'string') {
            memScore.autonWinner = prop as AUTON_WINNER
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

  async saveScore (matchId: number): Promise<undefined> {
    const memScore = this.getWorkingScore(matchId)
    await validateOrReject(memScore, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true
    })
    const score: Partial<MatchScoreInPrisma> = {}
    for (const entry in memScore) {
      const key: keyof MatchScoreInMemory =
        entry[0] as keyof MatchScoreInMemory
      const prop: MatchScoreInMemory[typeof key] = entry[1]
      switch (key) {
        case 'redScore':
        case 'blueScore':
          score[key] = JSON.stringify(prop)
          break
        case 'autonWinner':
          if (prop !== undefined) score[key] = prop as AUTON_WINNER
          break
        case 'locked':
          break
        case 'id':
          score.matchId = Number(prop)
          break
        // ts-standard error that I cant be bothered to deal with:
        // Unexpected lexical declaration in case block. (no-case-declarations)

        // default:
        //   const _exhaustiveCheck: never = key
        //   return _exhaustiveCheck
      }
    }
    const checkableScore = plainToClass(MatchScoreInPrisma, score)
    await validateOrReject(checkableScore, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true
    })
    await this.prisma.matchScore.create({ data: score as MatchScoreInPrisma })
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
