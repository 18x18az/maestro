import { TmModule } from '@/utils'
import { Module } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { FieldControlModule } from '../field-control'

@Module({
  imports: [TmModule, FieldControlModule],
  providers: [ResultsInternal]
})
export class ResultsModule { }
