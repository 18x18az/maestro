import { Module, forwardRef } from '@nestjs/common'
import { QualService } from './qual.service'
import { MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'
import { MatchService } from './match.service'
import { StageModule } from '../../stage'
import { FieldModule } from '../../field/field.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchEntity } from './match.entity'
import { BlockEntity } from './block.entity'
import { MatchController } from './match.controller'
import { TeamModule } from '../../team/team.module'
import { SittingEntity } from './sitting.entity'
import { ContestEntity } from './contest.entity'
import { BlockResolver } from './block.resolver'
import { ContestResolver } from './contest.resolver'
import { MatchResolver } from './match.resolver'
import { SittingResolver } from './sitting.resolver'

@Module({
  imports: [TeamModule, StageModule, forwardRef(() => FieldModule),
    TypeOrmModule.forFeature([MatchEntity, SittingEntity, ContestEntity, BlockEntity])
  ],
  controllers: [MatchController],
  providers: [QualService, MatchRepo, MatchInternal, MatchService, BlockResolver, ContestResolver, MatchResolver, SittingResolver],
  exports: [MatchService]
})
export class MatchModule {}
