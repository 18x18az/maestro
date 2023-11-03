import { Body, Controller, Param, Post } from '@nestjs/common'
import { DisplayService } from './display.service'

interface DisplayParams {
  uuid: string
}

@Controller('displays')
export class DisplayController {
  constructor (private readonly displaysService: DisplayService) {}

  @Post(':uuid/register')
  async registerDisplay (@Param() params: DisplayParams): Promise<void> {
    await this.displaysService.registerDisplay(params.uuid)
  }

  @Post(':uuid/hasFieldControl')
  async adviseHasFieldControl (
    @Param() params: DisplayParams,
      @Body() body: { hasFieldControl: boolean }
  ): Promise<void> {
    await this.displaysService.adviseHasFieldControl(
      params.uuid,
      body.hasFieldControl
    )
  }

  @Post(':uuid/name')
  async setDisplayName (
    @Param() params: DisplayParams,
      @Body() body: { name: string }
  ): Promise<void> {
    await this.displaysService.setDisplayName(
      params.uuid,
      body.name
    )
  }

  @Post(':uuid/assign')
  async assignFieldId (
    @Param() params: DisplayParams,
      @Body() body: { fieldId: number }
  ): Promise<void> {
    await this.displaysService.assignFieldId(
      params.uuid,
      body.fieldId
    )
  }
}
