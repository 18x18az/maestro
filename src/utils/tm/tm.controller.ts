import { Body, Controller, Post } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { IsUrl } from 'class-validator'

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
}
