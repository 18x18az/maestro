import { CalculableAllianceScore } from './alliance-score.object'
import { Tier, Winner } from './match.interface'
import { CalculableScore } from './score.interface'

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
