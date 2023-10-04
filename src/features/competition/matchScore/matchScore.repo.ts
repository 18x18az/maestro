import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import { RecursivePartial } from 'src/utils/recursivePartial'
import {
  AUTON_WINNER,
  MatchScore,
  MatchScoreInMemory,
  MatchScoreInPrisma
} from './matchScore.interface'

@Injectable()
export class MatchScoreDatabase {
  constructor (
    private readonly prisma: PrismaService,
    private readonly cache: InMemoryDBService<MatchScoreInMemory>
  ) {}

  // copy all scores into memoryDB and lock them
  async onApplicationBootstrap (): Promise<void> {}

  /** retrieves working score stored in memory */
  getWorkingScore (matchId: number): MatchScoreInMemory {
    return this.cache.get(matchId.toString())
  }

  getLockState (matchId: number): boolean {
    return this.getWorkingScore(matchId).locked
  }

  async updateScore (
    matchId: number,
    partialScore: RecursivePartial<MatchScore>
  ): Promise<void> {
    const memScore = this.getWorkingScore(matchId)
    for (const entry in partialScore) {
      const key: keyof RecursivePartial<MatchScore> =
        entry[0] as keyof RecursivePartial<MatchScore>
      const prop = entry[1]
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
    const score: Partial<MatchScoreInPrisma> = {}
    for (const entry in memScore) {
      const key: keyof MatchScoreInMemory =
        entry[0] as keyof MatchScoreInMemory
      const prop: MatchScoreInMemory[typeof key] = entry[1]
      switch (key) {
        case 'redScore':
        case 'blueScore':
          // @Todo check if prop is AllianceScore!!!
          score[key] = JSON.stringify(prop)
          break
        case 'autonWinner':
          // autonWinner is checked before being put into memScore
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
    // @Todo validate score

    await this.prisma.matchScore.create({ data: score as MatchScoreInPrisma })
  }

  async lockScore (matchId: number): Promise<void> {
    await this.updateScore(matchId, { locked: true })
  }

  async unlockScore (matchId: number): Promise<void> {
    await this.updateScore(matchId, { locked: false })
  }
}
