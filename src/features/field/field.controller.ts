import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { FieldService } from './field.service'

@Controller('field')
export class FieldController {
  constructor (private readonly service: FieldService) {}

  @Post('add')
  async addField (): Promise<void> {
    await this.service.addField()
  }

  @Post(':id/name')
  async updateName (@Param('id') id: number, @Body() body: { name: string }): Promise<void> {
    await this.service.setName(id, body.name)
  }

  @Delete(':id')
  async deleteField (@Param('id') id: number): Promise<void> {
    await this.service.deleteField(id)
  }
}
