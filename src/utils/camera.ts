async function cameraCommand (camera: number, payload: any) {
  let cameraIP
  if (camera === 1) {
    cameraIP = `${process.env.CAMA as string}`
  } else if (camera === 2) {
    cameraIP = `${process.env.CAMB as string}`
  } else if (camera === 3) {
    cameraIP = `${process.env.CAMC as string}`
  } else {
    return
  }
  const url = `http://${cameraIP}/ajaxcom?`
  const message = {
    SysCtrl: {
      PtzCtrl: payload
    }
  }

  try {
    const response = await fetch(url + new URLSearchParams({
      szCmd: JSON.stringify(message)
    }))
  } catch (err: any) {
    console.error(err.message)
  }
}

enum PRESET_ACTION {
  SET = 'preset_set',
  CALL = 'preset_call',
  CLEAN = 'preset_CLEAN'
}

async function presetAction (camera: number, preset: number, action: PRESET_ACTION) {
  const payload = {
    nChanel: 0,
    szPtzCmd: action,
    byValue: preset
  }
  await cameraCommand(camera, payload)
}

export async function callPreset (camera: number, preset: number) {
  console.log(`Camera ${camera} set to preset ${preset}`)
  await presetAction(camera, preset, PRESET_ACTION.CALL)
}
