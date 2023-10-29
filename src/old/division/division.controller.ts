import { Body, Controller, Post } from '@nestjs/common'
import { DivisionsCreate } from './division.interface'
import { DivisionService } from './division.service'

@Controller('division')
export class DivisionController {
  constructor (private readonly service: DivisionService) {}

  @Post()
  async createDivisions (@Body() body: DivisionsCreate): Promise<void> {
    await this.service.createDivisions(body.divisions)
  }
}
