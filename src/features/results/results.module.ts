import { TmModule } from '@/utils'
import { Module } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { StageModule } from '../stage'

@Module({
  imports: [TmModule, StageModule],
  providers: [ResultsInternal]
})
export class ResultsModule { }
