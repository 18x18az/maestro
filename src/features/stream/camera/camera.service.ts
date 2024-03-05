import { BadRequestException, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { CameraEntity } from './camera.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { PresetEntity } from './preset.entity'
import { CameraInternal } from './camera.internal'

@Injectable()
export class CameraService {
  constructor (
    @InjectRepository(CameraEntity) private readonly cameraRepo: Repository<CameraEntity>,
    @InjectRepository(PresetEntity) private readonly presetRepo: Repository<PresetEntity>,
    private readonly service: CameraInternal
  ) { }

  async findAll (): Promise<CameraEntity[]> {
    return await this.cameraRepo.find()
  }

  async findOne (id: number): Promise<CameraEntity> {
    return await this.cameraRepo.findOneOrFail({ where: { id } })
  }

  async addCamera (): Promise<CameraEntity[]> {
    const camera = new CameraEntity()
    camera.ip = '0.0.0.0'
    camera.name = 'Unnamed Camera'
    await this.cameraRepo.save(camera)
    return await this.findAll()
  }

  async editCamera (id: number, data: Partial<CameraEntity>): Promise<CameraEntity> {
    const camera = await this.findOne(id)
    await this.cameraRepo.save({ ...camera, ...data })
    return camera
  }

  async findPresets (id: number): Promise<PresetEntity[]> {
    return (await this.cameraRepo.findOneOrFail({ where: { id }, relations: ['presets'] })).presets
  }

  async findCurrentPreset (id: number): Promise<PresetEntity | undefined> {
    return await this.service.findCurrentPreset(id)
  }

  async callPreset (cameraId: number, presetId: number): Promise<void> {
    return await this.service.callPreset(cameraId, presetId)
  }

  async savePreset (cameraId: number): Promise<void> {
    return await this.service.savePreset(cameraId)
  }

  async createPreset (cameraId: number): Promise<CameraEntity> {
    const camera = await this.findOne(cameraId)
    const existing = (await this.findPresets(cameraId)).map(p => p.number)
    const number = Array.from({ length: 10 }, (_, i) => i).find(i => !existing.includes(i))

    if (number === undefined) throw new BadRequestException('No more presets available')

    const name = `Preset ${number}`

    const preset = new PresetEntity()
    preset.number = number
    preset.name = name
    preset.camera = camera
    await this.presetRepo.save(preset)

    await this.service.savePreset(cameraId)

    return camera
  }

  async deletePreset (cameraId: number, presetId: number): Promise<void> {
    const preset = await this.presetRepo.findOneOrFail({ where: { id: presetId, camera: { id: cameraId } } })
    await this.presetRepo.remove(preset)
  }
}
