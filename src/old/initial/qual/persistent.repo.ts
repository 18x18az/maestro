// import { Injectable } from '@nestjs/common'
// import { PrismaService } from '@/old_utils/prisma/prisma.service'
// import { Alliance, MatchResolution, QualMatch, QualScheduleBlockUpload, QualScheduleMatchUpload } from './qual-list.interface'

// export interface RawBlock {
//   id: number
//   start: Date
//   firstMatchId: number | null
//   cycleTime: number
// }

// export interface RawScheduledMatch {
//   id: number
//   matchId: number
//   resolution: MatchResolution
//   nextMatchId: number | null
//   fieldId: number
// }

// @Injectable()
// export class PersistentRepo {
//   constructor (private readonly repo: PrismaService) { }

//   async createBlock (block: QualScheduleBlockUpload): Promise<number> {
//     const data = {
//       start: block.start.toISOString(),
//       cycleTime: block.cycleTime
//     }
//     const { id } = await this.repo.matchBlock.create({ data })
//     return id
//   }

//   async createAlliance (alliance: Alliance): Promise<number> {
//     const data = {
//       team1Number: alliance.team1,
//       team2Number: alliance.team2
//     }

//     const { id } = await this.repo.alliance.create({ data })
//     return id
//   }

//   async createMatch (match: QualScheduleMatchUpload): Promise<number> {
//     const red = this.createAlliance(match.redAlliance)
//     const blue = this.createAlliance(match.blueAlliance)

//     const data = {
//       redId: await red,
//       blueId: await blue,
//       number: match.number,
//       round: 'QUAL'
//     }

//     const { id } = await this.repo.match.create({ data })
//     return id
//   }

//   async getMatches (): Promise<QualMatch[] | null> {
//     const matches = await this.repo.match.findMany({
//       include:
//         {
//           red:
//           { select: { team1Number: true, team2Number: true } },
//           blue:
//           { select: { team1Number: true, team2Number: true } }
//         }
//     })
//     if (matches === null) {
//       return null
//     }
//     return matches.map(match => {
//       return {
//         id: match.id,
//         number: match.number,
//         red: {
//           team1: match.red.team1Number,
//           team2: match.red.team2Number === null ? undefined : match.red.team1Number
//         },
//         blue: {
//           team1: match.blue.team1Number,
//           team2: match.blue.team2Number === null ? undefined : match.red.team1Number
//         }
//       }
//     })
//   }

//   async getMatchBlockIds (): Promise<number[]> {
//     const blockIds = (await this.repo.matchBlock.findMany({ select: { id: true } })).map(block => block.id)
//     return blockIds
//   }

//   async createScheduledMatch (match: QualMatch, fieldId: number): Promise<number> {
//     const scheduledMatch = await this.repo.scheduledMatch.create({
//       data: {
//         matchId: match.id,
//         resolution: MatchResolution.NOT_STARTED,
//         nextMatchId: null,
//         fieldId
//       }
//     })
//     return scheduledMatch.id
//   }

//   async getScheduledMatch (matchId: number): Promise<RawScheduledMatch> {
//     const scheduledMatch = await this.repo.scheduledMatch.findUnique({ where: { id: matchId } })

//     if (scheduledMatch === null) {
//       throw new Error(`Scheduled match ${matchId} not found`)
//     }

//     return scheduledMatch as RawScheduledMatch
//   }

//   async addMatchAfter (previousId: number, nextSittingId: number): Promise<void> {
//     await this.repo.scheduledMatch.update({ where: { id: previousId }, data: { nextMatchId: nextSittingId } })
//   }

//   async addFirstMatch (blockId: number, sittingId: number): Promise<void> {
//     await this.repo.matchBlock.update({ where: { id: blockId }, data: { firstMatchId: sittingId } })
//   }

//   async markSittingResolution (sittingId: number, resolution: MatchResolution): Promise<void> {
//     await this.repo.scheduledMatch.update({ where: { id: sittingId }, data: { resolution } })
//   }

//   async getFirstMatchId (blockId: number): Promise<number | null> {
//     const block = await this.repo.matchBlock.findUnique({ where: { id: blockId }, select: { firstMatchId: true } })
//     if (block === null) {
//       return null
//     }
//     return block.firstMatchId
//   }

//   async getBlocks (): Promise<RawBlock[]> {
//     const blocks = await this.repo.matchBlock.findMany({ orderBy: { id: 'asc' } })
//     return blocks.map(block => {
//       return {
//         id: block.id,
//         start: new Date(block.start),
//         firstMatchId: block.firstMatchId,
//         cycleTime: block.cycleTime
//       }
//     })
//   }
// }
