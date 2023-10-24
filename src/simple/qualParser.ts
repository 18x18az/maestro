import { MatchBlock, Match, MATCH_STATE } from './simple.interface'

export function qualParser (file: string, fields: number[]): [MatchBlock[], string[]] {
  const lines = file.split('\n').slice(1)

  const fieldDict: { [key: string]: number } = {}
  let usedFields = 0

  let currentBlock: MatchBlock = { matches: [] }
  const blocks: MatchBlock[] = [currentBlock]
  const previousTime: null | Date = null

  lines.forEach(line => {
    const split = line.split(',')

    const round = split[1]

    if (round !== '2') {
      return []
    }

    const matchNum = parseInt(split[3])
    const red1 = split[5]
    const red2 = split[6]
    const blue1 = split[8]
    const blue2 = split[9]
    const timeString = split[17]
    const time = new Date(timeString)

    const fieldName = split[4]
    let fieldId: number
    if (fieldName in fieldDict) {
      fieldId = fieldDict[fieldName]
    } else {
      if (usedFields >= fields.length) {
        throw new Error('Not enough fields')
      }
      fieldId = fields[usedFields]
      fieldDict[fieldName] = fieldId
      usedFields++
    }

    if (previousTime !== null && time.getTime() - previousTime.getTime() > 30 * 60 * 1000) {
      currentBlock = { matches: [] }
      blocks.push(currentBlock)
    }

    const qual: Match = { matchNum, fieldId, red1, red2, blue1, blue2, time, round: 0, sitting: 0, status: MATCH_STATE.NOT_STARTED }
    currentBlock.matches.push(qual)
  })

  const fieldNames = Object.keys(fieldDict)

  return [blocks, fieldNames]
}
