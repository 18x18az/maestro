// import { Injectable } from '@nestjs/common'
// import { PrismaService } from '../../../old_utils/prisma/prisma.service'
// import { AllianceRaw } from './alliance-raw.dto'
// import { AUTON_WINNER, OUTCOME_METADATA } from '.'
// import { isInstance } from 'class-validator'

// export interface SavedQualMetadata {
//   awp: boolean
//   team1: OUTCOME_METADATA
//   team2?: OUTCOME_METADATA

// }

// type SavedGenericAllianceMetadata = OUTCOME_METADATA | SavedQualMetadata

// interface SavedGenericMetadata {
//   red: SavedGenericAllianceMetadata
//   blue: SavedGenericAllianceMetadata
// }

// interface BaseSavedMatch {
//   matchId: number
//   blueRaw: AllianceRaw
//   redRaw: AllianceRaw
//   autonWinner: AUTON_WINNER
//   timeSaved: Date
// }

// interface SavedGenericMatch extends BaseSavedMatch {
//   metadata: SavedGenericMetadata
// }

// export interface SavedQualMatch extends BaseSavedMatch {
//   redMetadata: SavedQualMetadata
//   blueMetadata: SavedQualMetadata
// }

// export interface SavedElimMatch extends BaseSavedMatch {
//   redMetadata: OUTCOME_METADATA
//   blueMetadata: OUTCOME_METADATA
// }

// @Injectable()
// export class SavedScoreDatabase {
//   constructor (private readonly repo: PrismaService) {}

//   async getSavedGenericMatch (matchId: number): Promise<SavedGenericMatch | null> {
//     const savedScore = await this.repo.matchScore.findFirst({
//       where: { matchId },
//       orderBy: { timeSaved: 'desc' }
//     })

//     if (savedScore === null) {
//       return null
//     }

//     const blueRaw = JSON.parse(savedScore.blueScore) as AllianceRaw
//     const redRaw = JSON.parse(savedScore.redScore) as AllianceRaw

//     const autoWinner = savedScore.autonWinner as AUTON_WINNER

//     const metadata = JSON.parse(savedScore.metadata) as SavedGenericMetadata

//     return {
//       matchId,
//       blueRaw,
//       redRaw,
//       autonWinner: autoWinner,
//       metadata,
//       timeSaved: savedScore.timeSaved
//     }
//   }

//   async getSavedQualMatch (matchId: number): Promise<SavedQualMatch | null> {
//     const savedScore = await this.getSavedGenericMatch(matchId)

//     if (savedScore === null) {
//       return null
//     }

//     const red = savedScore.metadata.red
//     const blue = savedScore.metadata.blue

//     if (isInstance(red, String) || isInstance(blue, String)) {
//       throw new Error('Invalid metadata')
//     }

//     return savedScore as unknown as SavedQualMatch
//   }

//   async getSavedElimMatch (matchId: number): Promise<SavedElimMatch | null> {
//     const savedScore = await this.getSavedGenericMatch(matchId)

//     if (savedScore === null) {
//       return null
//     }

//     const red = savedScore.metadata.red
//     const blue = savedScore.metadata.blue

//     if (!isInstance(red, String) || !isInstance(blue, String)) {
//       throw new Error('Invalid metadata')
//     }

//     return savedScore as unknown as SavedElimMatch
//   }

//   async saveMatch (match: SavedQualMatch | SavedElimMatch): Promise<void> {
//     await this.repo.matchScore.create({
//       data: {
//         matchId: match.matchId,
//         autonWinner: match.autonWinner,
//         blueScore: JSON.stringify(match.blueRaw),
//         redScore: JSON.stringify(match.redRaw),
//         metadata: JSON.stringify({
//           red: match.redMetadata,
//           blue: match.blueMetadata
//         })
//       }
//     })
//   }
// }
