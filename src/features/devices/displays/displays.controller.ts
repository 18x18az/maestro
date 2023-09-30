import { Body, Controller, Param, Post } from '@nestjs/common'
import { DisplaysService } from './displays.service'

interface DisplayParams {
  uuid: string
}

@Controller('displays')
export class DisplaysController {
  constructor (private readonly displaysService: DisplaysService) {}

  @Post(':uuid/register')
  async registerDisplay (@Param() params: DisplayParams): Promise<void> {
    await this.displaysService.registerDisplay(params.uuid)
  }

  @Post(':uuid/hasFieldControl')
  async adviseHasFieldControl (@Param() params: DisplayParams, @Body() body: { hasFieldControl: boolean }): Promise<void> {
    await this.displaysService.adviseHasFieldControl(params.uuid, body.hasFieldControl)
  }
}
