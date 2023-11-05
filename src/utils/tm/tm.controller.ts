import { Body, Controller, Post } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { IsUrl } from 'class-validator'
import { EventPattern } from '@nestjs/microservices'
import { EventStage } from '@/features'

class TmBody {
  @IsUrl({ require_tld: false })
    address: string
}

@Controller('tm')
export class TmController {
  constructor (private readonly tmInternal: TmInternal) {}

  @Post('setAddress')
  async setAddress (@Body() body: TmBody): Promise<void> {
    await this.tmInternal.setAddress(body.address)
  }

  @EventPattern('stage')
  async onStageChange (data: { stage: EventStage }): Promise<void> {
    await this.tmInternal.onStageChange(data.stage)
  }
}
