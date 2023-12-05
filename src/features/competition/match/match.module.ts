import { Module } from '@nestjs/common'
import { MatchController } from './match.controller'
import { QualService } from './qual.service'
import { PrismaModule, PublishModule } from '@/utils'
import { MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'
import { MatchPublisher } from './match.publisher'
import { MatchService } from './match.service'
import { StageModule } from '../../stage'
import { FieldModule } from '@/features/field'

@Module({
  imports: [StageModule, PrismaModule, PublishModule, FieldModule],
  controllers: [MatchController],
  providers: [QualService, MatchRepo, MatchInternal, MatchPublisher, MatchService],
  exports: [MatchService]
})
export class MatchModule {}
