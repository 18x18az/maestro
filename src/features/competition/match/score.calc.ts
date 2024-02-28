import { CalculableAllianceScore, SavedAllianceScore } from './alliance-score.object'
import { Tier, Winner } from './match.interface'
import { CalculableScore, StoredScore } from './score.interface'

const AUTO_WINNER_POINTS = 8

function calculateElevation (robot: Tier, all: Tier[]): number {
  if (robot === Tier.NONE) return 0

  // remove duplicates from all since they are on the same tier
  all = all.filter((tier, index) => all.indexOf(tier) === index)

  // count the number of robots above the current robot
  const higher = all.filter(tier => tier !== Tier.NONE && tier > robot).length

  return 20 - (higher * 5)
}

export function calculateScore (raw: CalculableAllianceScore): number {
  const opponent = raw.opponent

  const allTiers = [raw.robot1Tier, raw.robot2Tier, opponent.robot1Tier, opponent.robot2Tier]

  const inGoal = raw.allianceInGoal + raw.triballsInGoal
  const inZone = raw.allianceInZone + raw.triballsInZone

  const elevationPoints = calculateElevation(raw.robot1Tier, allTiers) + calculateElevation(raw.robot2Tier, allTiers)

  let total = 0
  total += inGoal * 5
  total += inZone * 2
  total += elevationPoints

  if (raw.autoWinner === raw.color) {
    total += AUTO_WINNER_POINTS
  } else if (raw.autoWinner === Winner.TIE) {
    total += AUTO_WINNER_POINTS / 2
  }

  return total
}

export function calculateWinner (match: CalculableScore): Winner {
  const redScore = calculateScore(match.red)
  const blueScore = calculateScore(match.blue)

  if (redScore === blueScore) return Winner.TIE
  if (redScore > blueScore) return Winner.RED
  return Winner.BLUE
}

function makeAllianceEntry (raw: CalculableAllianceScore, wonAuto: boolean, tiedAuto: boolean, awp?: boolean): string[] {
  const retVal: string[] = []

  retVal.push(raw.allianceInGoal.toString())
  retVal.push(raw.allianceInZone.toString())
  retVal.push(raw.triballsInGoal.toString())
  retVal.push(raw.triballsInZone.toString())
  retVal.push(raw.robot1Tier)
  retVal.push(raw.robot2Tier)

  retVal.push(wonAuto ? ' ' : '')
  retVal.push(tiedAuto ? ' ' : '')

  if (awp !== undefined) {
    retVal.push(awp ? ' ' : '')
  }

  for (const team of raw.teams) {
    retVal.push(team.noShow ? ' ' : '')
    retVal.push(team.dq ? ' ' : '')
  }

  return retVal
}

export function makeString (match: CalculableScore): string {
  const red = makeAllianceEntry(match.red, match.red.autoWinner === 'red', match.red.autoWinner === 'tie', match.red.autoWp)
  const blue = makeAllianceEntry(match.blue, match.blue.autoWinner === 'blue', false, match.blue.autoWp)

  red.push(...blue)

  return red.join(',')
}

export function dehydrate (raw: StoredScore): string {
  return JSON.stringify(raw)
}

export function hydrate (raw: string): StoredScore {
  return JSON.parse(raw)
}

export function makeCalculableScore (match: StoredScore): CalculableScore {
  return {
    ...match,
    red: {
      ...match.red,
      color: 'red',
      autoWinner: match.autoWinner,
      opponent: match.blue
    },
    blue: {
      ...match.blue,
      color: 'blue',
      autoWinner: match.autoWinner,
      opponent: match.red
    }
  }
}

function makeEmptyAllianceScore (isElim: boolean, teamIds: number[]): SavedAllianceScore {
  const teams = teamIds.map((teamId) => ({ teamId, noShow: false, dq: false }))
  return {
    allianceInGoal: 0,
    allianceInZone: 0,
    triballsInGoal: 0,
    triballsInZone: 0,
    robot1Tier: Tier.NONE,
    robot2Tier: Tier.NONE,
    autoWp: isElim ? undefined : false,
    teams
  }
}

export function makeEmptyScore (matchId: number, isElim: boolean, redTeams: number[], blueTeams: number[]): StoredScore {
  const score: StoredScore = {
    red: makeEmptyAllianceScore(isElim, redTeams),
    blue: makeEmptyAllianceScore(isElim, blueTeams),
    autoWinner: Winner.NONE,
    matchId,
    isElim,
    locked: false,
    changed: true,
    hidden: isElim
  }

  return score
}
