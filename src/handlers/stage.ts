import { IMessage, MESSAGE_TYPE } from '@18x18az/rosetta'
import { getCompetitionStage, setCompetitionStage } from '../state/competitionStage'
import { IMetadata, LogType, record } from '../utils/log'

export function postCompetitionStageHandler (metadata: IMetadata, message: IMessage) {
  setCompetitionStage(metadata, message.payload)
};

export function getCompetitionStageHandler (metadata: IMetadata): IMessage {
  record(metadata, LogType.LOG, 'competition requested')
  const stage = getCompetitionStage()
  return {
    type: MESSAGE_TYPE.POST,
    path: ['stage'],
    payload: stage
  }
}
