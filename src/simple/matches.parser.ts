import * as crytpo from 'crypto'
import parse from 'node-html-parser'
import { ElimMatch } from './simple.interface'

let lastHash = ''

export function parseElimMatches (data: string): ElimMatch[] | null {
  const hashedValue = crytpo.createHash('sha1').update(data).digest('base64')

  if (hashedValue === lastHash) {
    return null
  }

  lastHash = hashedValue

  const root = parse(data)

  const table = root.querySelector('table')
  if (table === null) {
    return null
  }

  const rows = table.querySelectorAll('tr')
  if (rows.length === 0) {
    return null
  }

  const results = rows.flatMap(row => {
    const cells = row.querySelectorAll('td')
    const test = cells[0]

    if (test === undefined) {
      return []
    }

    const matchName = test.rawText

    let round: number

    if (matchName.startsWith('R16')) { round = 1 } else if (matchName.startsWith('QF')) { round = 2 } else if (matchName.startsWith('SF')) { round = 3 } else if (matchName.startsWith('F')) { round = 4 } else { return [] }

    const matchIdent = matchName.split(' ')[1]

    const [matchNum, sitting] = matchIdent.split('-')

    const red1 = cells[1].rawText
    const red2 = cells[2].rawText
    const blue1 = cells[3].rawText
    const blue2 = cells[4].rawText

    const match: ElimMatch = {
      round,
      matchNum: Number(matchNum),
      sitting: Number(sitting) - 1,
      red1,
      red2,
      blue1,
      blue2
    }

    return match
  })

  if (results.length === 0) {
    return null
  }

  return results
}
