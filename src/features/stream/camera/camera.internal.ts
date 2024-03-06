import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { firstValueFrom } from 'rxjs'
import { CameraEntity } from './camera.entity'
import { Repository } from 'typeorm'
import { HttpService } from '@nestjs/axios'
import { PresetEntity } from './preset.entity'

enum PRESET_ACTION {
  SET = 'preset_set',
  CALL = 'preset_call',
  CLEAN = 'preset_CLEAN'
}

@Injectable()
export class CameraInternal {
  private readonly logger: Logger = new Logger(CameraInternal.name)

  private readonly currentPresets: Map<number, number> = new Map()

  constructor (
    @InjectRepository(CameraEntity) private readonly cameraRepo: Repository<CameraEntity>,
    @InjectRepository(PresetEntity) private readonly presetRepo: Repository<PresetEntity>,
    private readonly request: HttpService
  ) {}

  private async cameraCommand (cameraIp: string, payload: any): Promise<void> {
    const message = {
      SysCtrl: {
        PtzCtrl: payload
      }
    }
    const url = `http://${cameraIp}/ajaxcom?szCmd=${JSON.stringify(message)}`
    try {
      await firstValueFrom(
        this.request.get(url)
      )
    } catch (e: unknown) {
      this.logger.warn(`Error calling camera: ${JSON.stringify(e)}`)
    }
  }

  private async presetAction (cameraId: number, presetId: number, action: PRESET_ACTION): Promise<void> {
    const cameraEntity = await this.cameraRepo.findOneOrFail({ where: { id: cameraId }, relations: ['presets'] })
    const ip = cameraEntity.ip
    const preset = cameraEntity.presets.find(p => p.id === presetId)

    if (preset === undefined) throw new BadRequestException(`Preset ${presetId} not found on camera ${cameraId}`)

    this.logger.log(`Sending ${action} to camera ${cameraId} for preset ${presetId}`)

    const payload = {
      nChanel: 0,
      szPtzCmd: action,
      byValue: preset.number
    }
    await this.cameraCommand(ip, payload)
  }

  async callPreset (cameraId: number, presetId: number): Promise<void> {
    this.logger.log(`Calling preset ${presetId} on camera ${cameraId}`)
    await this.presetAction(cameraId, presetId, PRESET_ACTION.CALL)
    this.currentPresets.set(cameraId, presetId)
  }

  async savePreset (cameraId: number): Promise<void> {
    const presetId = this.getCurrentPresetId(cameraId)

    if (presetId === undefined) throw new BadRequestException('No preset selected')

    this.logger.log(`Saving preset ${presetId} on camera ${cameraId}`)
    await this.presetAction(cameraId, presetId, PRESET_ACTION.SET)
  }

  async createPreset (cameraId: number, presetId: number): Promise<void> {
    this.currentPresets.set(cameraId, presetId)
    await this.savePreset(cameraId)
  }

  private getCurrentPresetId (cameraId: number): number | undefined {
    return this.currentPresets.get(cameraId)
  }

  async findCurrentPreset (cameraId: number): Promise<PresetEntity | undefined> {
    const id = this.getCurrentPresetId(cameraId)
    if (id === undefined) return undefined
    return await this.presetRepo.findOneOrFail({ where: { id } })
  }
}
