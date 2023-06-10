import { IMessage } from '@18x18az/rosetta'
import { OVERLAY, Studio, TRANSITION_TYPE } from '../managers/obs'
import { IMetadata } from '../utils/log'

export async function postDirectorHandler (metadata: IMetadata, message: IMessage) {
  const command = message.path[1]

  if (command === 'transition') {
    await transitionHandler(metadata, message.payload)
  }

  if (command === 'overlay') {
    await overlayHandler(metadata, message.payload)
  }
}

async function transitionHandler (metadata: IMetadata, transition: string) {
  if (transition === 'cut') {
    Studio.triggerTransition(TRANSITION_TYPE.CUT)
    return
  };

  if (transition === 'sting') {
    Studio.triggerTransition(TRANSITION_TYPE.STINGER)
  }
}

async function overlayHandler (metadata: IMetadata, overlay: string) {
  if (overlay === 'clean') {
    Studio.setPreviewOverlay(OVERLAY.NONE)
  } else if (overlay === 'timer') {
    Studio.setPreviewOverlay(OVERLAY.TIMER)
  } else if (overlay === 'audience') {
    Studio.setPreviewOverlay(OVERLAY.AUDIENCE)
  }
}
