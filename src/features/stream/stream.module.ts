import { Module } from '@nestjs/common'
import { ObsService } from './obs.service'
import { FieldDisplayService } from './field-display.service'
import { HttpModule } from '@nestjs/axios'
import { SceneService } from './scene.service'
import { FieldModule } from '../field/field.module'

@Module({
  imports: [FieldModule, HttpModule],
  providers: [ObsService, FieldDisplayService, SceneService],
  exports: [FieldDisplayService]
})
export class StreamModule {}
