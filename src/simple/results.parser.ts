import parse from 'node-html-parser'
import * as crytpo from 'crypto'
import { MatchResult } from './simple.interface'

let lastHash = ''

export function parseQualResults (data: string): MatchResult[] | null {
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
    // check if it starts with Q followed by a number, else return []
    if (!matchName.startsWith('Q')) {
      return []
    }
    const matchNumber = Number(matchName.slice(1))
    if (isNaN(matchNumber)) {
      return []
    }

    const redScore = Number(cells[5].rawText)
    const blueScore = Number(cells[6].rawText)

    if (redScore === 0 && blueScore === 0) {
      return []
    }

    const matchResult: MatchResult = { round: 0, match: matchNumber, sitting: 0, redScore, blueScore }
    return matchResult
  })

  if (results.length === 0) {
    return null
  }

  return results
}
