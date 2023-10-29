import { QualMatch } from '@/old/initial'
import { AUTON_WINNER, AllianceRaw, ELEVATION, ElimMatchScoreAllianceMetadata, OUTCOME_METADATA, PublishedQualMatchScore, QualMatchScoreAllianceMetadata, QualMatchScoreTeamMetadata } from '.'
import { SavedQualMatch, SavedQualMetadata } from './match-saved.repo'

export function createEmptyRawAllianceScore (): AllianceRaw {
  return {
    goalTriballs: 0,
    zoneTriballs: 0,
    allianceTriballsInGoal: 0,
    allianceTriballsInZone: 0,
    robot1Tier: ELEVATION.NONE,
    robot2Tier: ELEVATION.NONE
  }
}

export interface Alliance {
  team1: string
  team2?: string
}

function createQualTeamMetadata (team: string): QualMatchScoreTeamMetadata {
  return {
    team,
    outcome: OUTCOME_METADATA.NONE
  }
}

export function createQualAllianceMetadata (alliance: Alliance): QualMatchScoreAllianceMetadata {
  return {
    team1: createQualTeamMetadata(alliance.team1),
    team2: alliance.team2 === undefined ? undefined : createQualTeamMetadata(alliance.team2),
    autonWinPoint: false
  }
}

function hydrateQualTeamMetadata (team: string, outcome: OUTCOME_METADATA): QualMatchScoreTeamMetadata {
  return {
    team,
    outcome
  }
}

function hydrateQualAllianceMetadata (alliance: Alliance, meta: SavedQualMetadata): QualMatchScoreAllianceMetadata {
  return {
    team1: hydrateQualTeamMetadata(alliance.team1, meta.team1),
    team2: (alliance.team2 === undefined || meta.team2 === undefined) ? undefined : hydrateQualTeamMetadata(alliance.team2, meta.team2),
    autonWinPoint: meta.awp
  }
}

export function hydrateQualMatch (matchInfo: QualMatch, storedData: SavedQualMatch): PublishedQualMatchScore {
  return {
    red: hydrateQualAllianceMetadata(matchInfo.red, storedData.redMetadata),
    blue: hydrateQualAllianceMetadata(matchInfo.blue, storedData.blueMetadata),
    id: matchInfo.id.toString(),
    autonWinner: storedData.autonWinner,
    locked: true,
    saved: true,
    redRaw: storedData.redRaw,
    blueRaw: storedData.blueRaw,
    matchNumber: matchInfo.number
  }
}

export function createQualMatch (matchInfo: QualMatch): PublishedQualMatchScore {
  const id = matchInfo.id.toString()
  const created: PublishedQualMatchScore = {
    matchNumber: matchInfo.number,
    redRaw: createEmptyRawAllianceScore(),
    blueRaw: createEmptyRawAllianceScore(),
    autonWinner: AUTON_WINNER.NONE,
    id,
    locked: false,
    saved: false,
    red: createQualAllianceMetadata(matchInfo.red),
    blue: createQualAllianceMetadata(matchInfo.blue)
  }

  return created
}

export function createElimMatchAllianceMetadata (alliance: Alliance): ElimMatchScoreAllianceMetadata {
  return {
    team1: {
      team: alliance.team1
    },
    team2: alliance.team2 === undefined
      ? undefined
      : {
          team: alliance.team2
        },
    outcome: OUTCOME_METADATA.NONE
  }
}
