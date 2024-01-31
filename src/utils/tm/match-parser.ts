import { Alliance, Round } from '../../features/competition/match/match.interface'
import { HTMLElement } from 'node-html-parser'
import { MatchIdentifier } from './tm.interface'

function getMatchRound (matchName: string): Round {
  let round = Round.QUAL
  if (matchName.startsWith('R16')) {
    round = Round.Ro16
  } else if (matchName.startsWith('QF')) {
    round = Round.QF
  } else if (matchName.startsWith('SF')) {
    round = Round.SF
  } else if (matchName.startsWith('F')) {
    round = Round.F
  }

  return round
}

export function getMatchIdent (matchName: string): MatchIdentifier {
  const round = getMatchRound(matchName)
  let contest: number = 0
  let match: number = 1
  if (round === Round.QUAL) {
    contest = parseInt(matchName.substring(1))
  } else if (round === Round.F) {
    contest = 1
    match = parseInt(matchName.split(' ')[1])
  } else {
    const info = matchName.split(' ')[1]
    const parts = info.split('-')
    contest = parseInt(parts[0])
    match = parseInt(parts[1])
  }

  return { round, contest, match }
}

export function getAlliance (cells: HTMLElement[], offset: number): Alliance {
  return {
    team1: cells[offset].rawText,
    team2: cells[offset + 1].rawText
  }
}
