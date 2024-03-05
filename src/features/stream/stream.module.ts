import { Module } from '@nestjs/common'
import { CameraModule } from './camera/camera.module'

@Module({
  imports: [CameraModule]
})
export class StreamModule {}
