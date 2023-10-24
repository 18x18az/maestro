import { QualBlock, QualMatch } from './simple.interface'

export function qualParser (file: string, fields: number[]): [QualMatch[], string[]] {
  const lines = file.split('\n').slice(1)

  const fieldDict: { [key: string]: number } = {}
  let usedFields = 0

  const matches = lines.flatMap(line => {
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

    const qual: QualMatch = { matchNum, fieldId, red1, red2, blue1, blue2, time }
    return qual
  })

  const fieldNames = Object.keys(fieldDict)

  return [matches, fieldNames]
}

export function blockParser (quals: QualMatch[]): QualBlock[] {
  let currentBlock: QualBlock = { matches: [] }
  const blocks: QualBlock[] = [currentBlock]

  let previousTime: null | Date = null

  for (const qual of quals) {
    if (previousTime !== null && qual.time.getTime() - previousTime.getTime() > 30 * 60 * 1000) {
      currentBlock = { matches: [] }
      blocks.push(currentBlock)
    }
    currentBlock.matches.push(qual)
    previousTime = qual.time
  }

  return blocks
}
