import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

enum PRESET_ACTION {
  SET = 'preset_set',
  CALL = 'preset_call',
  CLEAN = 'preset_CLEAN'
}

@Injectable()
export class CameraService {
  private readonly logger: Logger = new Logger(CameraService.name)

  constructor (
    private readonly request: HttpService
  ) {}

  private async cameraCommand (camera: number, payload: any): Promise<void> {
    const cameraIPs = ['192.168.1.75', '192.168.1.115', '1.2.3.4']
    const message = {
      SysCtrl: {
        PtzCtrl: payload
      }
    }
    const url = `http://${cameraIPs[camera]}/ajaxcom?szCmd=${JSON.stringify(message)}`
    try {
      await firstValueFrom(
        this.request.get(url)
      )
    } catch (e: unknown) {
      this.logger.warn(`Error calling camera: ${JSON.stringify(e)}`)
    }
  }

  private async presetAction (camera: number, preset: number, action: PRESET_ACTION): Promise<void> {
    const payload = {
      nChanel: 0,
      szPtzCmd: action,
      byValue: preset
    }
    await this.cameraCommand(camera, payload)
  }

  async callPreset (camera: number, preset: number): Promise<void> {
    this.logger.log(`Calling preset ${preset} on camera ${camera + 1}`)
    // await this.presetAction(camera, preset, PRESET_ACTION.CALL)
  }
}
