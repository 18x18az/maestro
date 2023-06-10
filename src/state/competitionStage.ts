import { COMPETITION_STAGE, MESSAGE_TYPE } from '@18x18az/rosetta'
import { OVERLAY } from '../managers/obs'
import { Director } from '../managers/stream'
import { IMetadata, LogType, record } from '../utils/log'
import { broadcast } from '../utils/wss'

let currentStage = COMPETITION_STAGE.IDLE

export function getCompetitionStage () {
  return currentStage
}

export async function setCompetitionStage (meta: IMetadata, stage: COMPETITION_STAGE) {
  record(meta, LogType.LOG, `Competition stage is now ${stage}`)
  currentStage = stage

  broadcast(
    meta, {
      type: MESSAGE_TYPE.POST,
      path: ['stage'],
      payload: stage
    }
  )

  switch (stage) {
    case COMPETITION_STAGE.AWARDS: {
      Director.setView(`${process.env.AWARD_FIXED as string}`, OVERLAY.NONE)
      break
    }
  }
}
