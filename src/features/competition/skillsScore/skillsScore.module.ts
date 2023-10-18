import { Module } from '@nestjs/common'
import { PublishService } from 'utils/publish/publish.service'
import { SkillsScorePublisher } from './skillsScore.publisher'

@Module({
  providers: [PublishService, SkillsScorePublisher]
})

export class SkillsScoreModule {}
