import { Module } from '@nestjs/common'
import { ResultsDisplayService } from './results-display'
import { PublishModule } from '@/utils'
import { StreamPublisher } from './stream.publisher'
import { ObsService } from './obs.service'
import { FieldDisplayService } from './field-display.service'
import { FieldModule } from '../field'
import { StreamController } from './stream.controller'

@Module({
  imports: [PublishModule, FieldModule],
  controllers: [StreamController],
  providers: [ResultsDisplayService, StreamPublisher, ObsService, FieldDisplayService],
  exports: [ResultsDisplayService, FieldDisplayService]
})
export class StreamModule {}
