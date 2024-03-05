import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CameraEntity } from './camera.entity'
import { CameraResolver } from './camera.resolver'
import { CameraService } from './camera.service'
import { CameraInternal } from './camera.internal'
import { HttpModule } from '@nestjs/axios'
import { PresetEntity } from './preset.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CameraEntity, PresetEntity]), HttpModule],
  providers: [CameraResolver, CameraService, CameraInternal]
})
export class CameraModule {}
