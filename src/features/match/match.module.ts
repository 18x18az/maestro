import { Module } from '@nestjs/common'
import { StageModule } from '../stage'
import { MatchController } from './match.controller'
import { QualService } from './qual.service'
import { FieldModule } from '../field'
import { PrismaModule, PublishModule } from '@/utils'
import { MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'
import { MatchPublisher } from './match.publisher'

@Module({
  imports: [StageModule, FieldModule, PrismaModule, PublishModule],
  controllers: [MatchController],
  providers: [QualService, MatchRepo, MatchInternal, MatchPublisher],
  exports: []
})
export class MatchModule {}
