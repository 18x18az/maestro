import { Module } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { MatchScorePublisher } from './matchScore.publisher'

@Module({
  providers: [PublishService, MatchScorePublisher]
})

export class MatchScoreModule {}
