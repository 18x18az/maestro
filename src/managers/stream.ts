import { COMPETITION_STAGE } from '@18x18az/rosetta'
import { callPreset } from '../utils/camera'
import { OVERLAY, Studio } from './obs'

export namespace Director {
  let currentField: number = 1

  export async function setView (view: string, overlay: OVERLAY) {
    const components = view.split(',')
    const scene = parseInt(components[0])
    Studio.setPreviewScene(scene, overlay)
    if (components.length > 1) {
      const preset = parseInt(components[1])
      callPreset(scene, preset)
    }
  }

  export async function setAudience () {
    let nextAudienceScene = currentField - 1
    if (nextAudienceScene === 0) {
      nextAudienceScene = 3
    }

    Studio.setAudience(nextAudienceScene)
    callPreset(nextAudienceScene, 1)
  }

  export async function setField (fieldString: string) {
    const field = parseInt(fieldString)

    if (field === 0) {
      return
    }

    currentField = field
    Studio.setField(field)
    callPreset(field, 0)
  }
}
