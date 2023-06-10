import { IMessage, MESSAGE_TYPE, ISimpleMatchResult } from '@18x18az/rosetta'
import { IMetadata, LogType, record } from '../utils/log'
import { broadcast } from '../utils/wss'
import { setDisplayState } from './display'

let latestScore: ISimpleMatchResult | null = null

export function postScoreHandler (metadata: IMetadata, message: IMessage) {
  latestScore = message.payload as ISimpleMatchResult
  record(metadata, LogType.LOG, `match ${latestScore.name} scored`)
  broadcast(metadata, message)
}

export function getScoreHandler (metadata: IMetadata): IMessage | null {
  record(metadata, LogType.LOG, 'latest score requested')
  if (latestScore != null) {
    return {
      type: MESSAGE_TYPE.POST,
      path: ['score'],
      payload: latestScore
    }
  } else {
    return null
  }
}
