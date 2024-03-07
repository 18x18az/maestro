import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AwardEntity } from './award.entity'
import { AwardResolver } from './award.resolver'
import { TmModule } from '../../utils/tm/tm.module'
import { AwardService } from './award.service'
import { TeamModule } from '../team/team.module'

@Module({
  imports: [
    TmModule,
    TypeOrmModule.forFeature([AwardEntity]),
    forwardRef(() => TeamModule)
  ],
  providers: [AwardResolver, AwardService],
  exports: [AwardService]
})
export class AwardModule {}
