import { HttpService } from '@nestjs/axios'
import { Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

enum PRESET_ACTION {
  SET = 'preset_set',
  CALL = 'preset_call',
  CLEAN = 'preset_CLEAN'
}

export class Camera {
  private readonly logger: Logger = new Logger(Camera.name)

  desired_preset: number | null = null
  is_active_scene: boolean

  constructor (
    private readonly ip: string,
    private readonly request: HttpService
  ) {}

  private async cameraCommand (payload: any): Promise<void> {
    const message = {
      SysCtrl: {
        PtzCtrl: payload
      }
    }
    const url = `http://${this.ip}/ajaxcom?szCmd=${JSON.stringify(message)}`
    try {
      await firstValueFrom(
        this.request.get(url)
      )
    } catch (e: unknown) {
      this.logger.warn(`Error calling camera: ${JSON.stringify(e)}`)
    }
  }

  private async presetAction (preset: number, action: PRESET_ACTION): Promise<void> {
    const payload = {
      nChanel: 0,
      szPtzCmd: action,
      byValue: preset
    }
    await this.cameraCommand(payload)
  }

  private async call_preset (): Promise<void> {
    const target = this.desired_preset
    if (target === null) {
      return
    }
    this.logger.log(`Calling preset ${target} on camera ${this.ip}`)
    await this.presetAction(target, PRESET_ACTION.CALL)
    this.desired_preset = null
  }

  async set_desired_preset (preset: number): Promise<void> {
    this.logger.debug(`Setting desired preset to ${preset} on camera ${this.ip}`)
    this.desired_preset = preset
    if (!this.is_active_scene) {
      await this.call_preset()
    }
  }

  async set_is_active_scene (active: boolean): Promise<void> {
    if (this.is_active_scene !== active) {
      this.logger.log(`Setting is_active_scene to ${JSON.stringify(active)} on camera ${this.ip}`)
      this.is_active_scene = active
      if (this.desired_preset !== null && !active) {
        await this.call_preset()
      }
    }
  }
}
