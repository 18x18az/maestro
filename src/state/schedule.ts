import { announce } from '../utils/announcement'
import { IMetadata, LogType, record } from '../utils/log'

let currentMatch = ''

let blocks: ScheduleBlock[] = []

let currentScheduleBlock: null | ScheduleBlock = null

let highestMatch = 0

export interface ScheduleBlock {
  start: Date
  stop: Date
  matches: number[]
}

export function matchChanged (meta: IMetadata, match: string) {
  currentMatch = match

  if (match.startsWith('Q')) {
    const matchNumber = parseInt(currentMatch.slice(1))
    if ((currentScheduleBlock == null) || matchNumber > currentScheduleBlock.matches[currentScheduleBlock.matches.length - 1] || matchNumber < currentScheduleBlock.matches[0]) {
      for (const block of blocks) {
        if (block.matches[0] <= matchNumber && matchNumber <= block.matches[block.matches.length - 1]) {
          currentScheduleBlock = block
          record(meta, LogType.LOG, 'Schedule block changed')
          break
        }
      }
    }
  }
}

export function setScheduleBlocks (meta: IMetadata, schedule: ScheduleBlock[]) {
  blocks = schedule
}

export async function announceQueue (meta: IMetadata) {
  if (currentMatch.startsWith('Q')) {
    const currentMatchNumber = parseInt(currentMatch.slice(1))
    const targetMatch = currentMatchNumber + 3
    if (currentMatchNumber >= highestMatch && (currentScheduleBlock != null) && targetMatch <= currentScheduleBlock.matches[currentScheduleBlock.matches.length - 1]) {
      highestMatch = currentMatchNumber
      announce(meta, `Queueing match ${targetMatch}, match ${targetMatch}`)
    }
  };
}
