// import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
// import { Injectable } from '@nestjs/common'
// import { PublishedElimMatchScore, PublishedQualMatchScore } from '.'

// @Injectable()
// export class WorkingScoreDatabase {
//   constructor (
//     private readonly quals: InMemoryDBService<PublishedQualMatchScore>,
//     private readonly elims: InMemoryDBService<PublishedElimMatchScore>
//   ) {}

//   getQual (matchId: number): PublishedQualMatchScore | null {
//     return this.quals.get(matchId.toString())
//   }

//   getElim (matchId: number): PublishedElimMatchScore {
//     return this.elims.get(matchId.toString())
//   }

//   saveQual (match: PublishedQualMatchScore): void {
//     this.quals.update(match)
//   }

//   saveElim (match: PublishedElimMatchScore): void {
//     this.elims.update(match)
//   }
// }
