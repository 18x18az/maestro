import { IAward, IAwards, MESSAGE_TYPE } from '@18x18az/rosetta'
import { OVERLAY, Studio, TRANSITION_TYPE } from '../managers/obs'
import { Director } from '../managers/stream'
import { IMetadata, LogType, record } from '../utils/log'
import { broadcast } from '../utils/wss'
import { STINGER_DELAY_SECONDS } from '../timing'

enum AWARD_STAGE {
  IDLE,
  WAITING,
  DESCRIPTION,
  ANTICIPATION,
  WALKOUT,
  RECEIPT
}

let awards: IAwards
let selectedAward: IAward | null = null
let stage: AWARD_STAGE = AWARD_STAGE.IDLE

// Would probably be easier to just include whether it's pushed in the return value, so that way emcee can see it but audience can't
export function getSelectedAward (): IAward | null {
  if (selectedAward == null) {
    return null
  }

  if (stage === AWARD_STAGE.WALKOUT || stage === AWARD_STAGE.RECEIPT) {
    return selectedAward
  } else {
    const modified = JSON.parse(JSON.stringify(selectedAward)) as IAward
    modified.winner = null
    return modified
  }
}

export function updateAwards (metadata: IMetadata, updatedAwards: IAwards) {
  record(metadata, LogType.LOG, 'awards updated')
  awards = updatedAwards
  broadcast(metadata, {
    type: MESSAGE_TYPE.POST,
    path: ['awards'],
    payload: awards
  })
}

export function selectAward (metadata: IMetadata, index: number) {
  const awardToUse = JSON.parse(JSON.stringify(awards[index]))
  record(metadata, LogType.LOG, 'Award selected')
  record(metadata, LogType.LOG, `Selected ${awardToUse.name}`)
  const alreadySelected = selectedAward !== null
  selectedAward = awardToUse
  stage = AWARD_STAGE.WAITING

  // Only push the presenter view if it's not already live
  if (!alreadySelected) {
    Studio.triggerTransition(TRANSITION_TYPE.CUT)
    setTimeout(() => { Director.setView(`${process.env.AWARD_FIXED as string}`, OVERLAY.AUDIENCE) }, STINGER_DELAY_SECONDS * 1000)
  }

  broadcast(metadata, {
    type: MESSAGE_TYPE.POST,
    path: ['awards', 'selected'],
    payload: getSelectedAward()
  })
}

export function cueNext (metadata: IMetadata) {
  switch (stage) {
    case AWARD_STAGE.WAITING: { // Shows the name of the award as it's described, next stage is the audience
      stage = AWARD_STAGE.DESCRIPTION
      Studio.triggerTransition(TRANSITION_TYPE.CUT)
      setTimeout(() => { Director.setView(`${process.env.AWARD_AUDIENCE as string}`, OVERLAY.AUDIENCE) }, 500)
      break
    }
    case AWARD_STAGE.DESCRIPTION: { // Shows the audience as the name is about to be read out, next stage is name reveal, next camera is receive cam
      stage = AWARD_STAGE.ANTICIPATION
      Studio.triggerTransition(TRANSITION_TYPE.CUT)
      setTimeout(() => { Director.setView(`${process.env.AWARD_RECEIVE as string}`, OVERLAY.AUDIENCE) }, 500)
      break
    }
    case AWARD_STAGE.ANTICIPATION: { // Reveals the name and shows team walking out to get award, next camera is still receive cam
      stage = AWARD_STAGE.WALKOUT
      broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['awards', 'selected'],
        payload: getSelectedAward()
      })
      break
    }
    case AWARD_STAGE.WALKOUT: { // Team is now receiving the award, next camera resets back to presenter
      stage = AWARD_STAGE.RECEIPT
      Studio.triggerTransition(TRANSITION_TYPE.CUT)
      setTimeout(() => { Director.setView(`${process.env.AWARD_FIXED as string}`, OVERLAY.NONE) }, 500)
      break
    }
    case AWARD_STAGE.RECEIPT: { // Done receiving award, go back to presenter, no award select
      stage = AWARD_STAGE.IDLE

      Studio.triggerTransition(TRANSITION_TYPE.CUT)
      setTimeout(() => { Director.setView(`${process.env.AWARD_FIXED as string}`, OVERLAY.AUDIENCE) }, 500)
      broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['awards', 'selected'],
        payload: getSelectedAward()
      })
      break
    }
  }
}
