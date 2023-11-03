import { TmModule } from '@/utils'
import { Module } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { FieldControlModule } from '../field-control'
import { StageModule } from '../stage'
import { MatchModule } from '../match'

@Module({
  imports: [TmModule, FieldControlModule, StageModule, MatchModule],
  providers: [ResultsInternal]
})
export class ResultsModule { }
