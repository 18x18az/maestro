import { Studio } from '../managers/obs'
import { IMetadata } from '../utils/log'
import { IMessage, MESSAGE_TYPE } from '@18x18az/rosetta'
import { holdForScore, setHoldForScore } from '../state/matchStage'

export async function postHoldScoreHandler (metadata: IMetadata, message: IMessage) {
  console.log(message.payload)
  setHoldForScore(metadata, message.payload)
}

export function getHoldForScoreHandler (metadata: IMetadata): IMessage {
  return {
    type: MESSAGE_TYPE.POST,
    path: ['hold'],
    payload: holdForScore
  }
}
