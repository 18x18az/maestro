import { MatchIdentifier, Round } from '@/features'

export function makeMatchName (match: MatchIdentifier): string {
  let preamble = 'Q'
  if (match.round === Round.Ro16) {
    preamble = 'Ro16'
  } else if (match.round === Round.QF) {
    preamble = 'QF'
  } else if (match.round === Round.SF) {
    preamble = 'SF'
  } else if (match.round === Round.F) {
    preamble = 'F'
  }

  const output = `${preamble} ${match.matchNumber}`

  return output
}

// export function makeReplayName (match: ScheduledMatch): string {
//   let output = makeMatchName(match)

//   if (match.replay !== 0) {
//     output += ` R${match.replay}`
//   }

//   return output
// }
