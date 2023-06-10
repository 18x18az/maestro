import { COMPETITION_STAGE, IMessage, MESSAGE_TYPE } from '@18x18az/rosetta'
import { getMatchStage } from '../state/matchStage'
import { IMetadata, LogType, record } from '../utils/log'
import { broadcast } from '../utils/wss'

export function getMatchStageHandler (metadata: IMetadata): IMessage {
  record(metadata, LogType.LOG, 'match stage requested')
  const stage = getMatchStage()
  return {
    type: MESSAGE_TYPE.POST,
    path: ['matchStage'],
    payload: stage
  }
}
