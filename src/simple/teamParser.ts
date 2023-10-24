import { parse } from 'node-html-parser'
import { Team } from './simple.interface'

export function teamParser (data: string): Team[] | null {
  const root = parse(data)
  const table = root.querySelector('table')
  if (table === null) {
    return null
  }

  const rows = table.querySelectorAll('tr')
  if (rows.length === 0) {
    return null
  }

  const teams = rows.flatMap(row => {
    const cells = row.querySelectorAll('td')
    const test = cells[0]

    if (test === undefined) {
      return []
    }

    const number = test.rawText
    const name = cells[1].rawText
    const location = cells[2].rawText
    const school = cells[3].rawText

    const team = { number, name, location, school }
    return team
  })

  return teams
}
