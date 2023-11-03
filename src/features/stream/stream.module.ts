import { Module } from '@nestjs/common'
import { ResultsDisplayService } from './results-display'
import { PublishModule } from '@/utils'
import { StreamPublisher } from './stream.publisher'
import { ObsService } from './obs.service'
import { FieldDisplayService } from './field-display.service'
import { FieldModule } from '../field'
import { StreamController } from './stream.controller'
import { CameraService } from './camera.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [PublishModule, FieldModule, HttpModule],
  controllers: [StreamController],
  providers: [ResultsDisplayService, StreamPublisher, ObsService, FieldDisplayService, CameraService],
  exports: [ResultsDisplayService, FieldDisplayService]
})
export class StreamModule {}
