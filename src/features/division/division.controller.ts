import { Body, Controller, Post } from '@nestjs/common'
import { DivisionCreate } from './division.interface'
import { DivisionService } from './division.service'

@Controller('division')
export class DivisionController {
  constructor (private readonly service: DivisionService) {}

  @Post()
  async createDivisions (@Body() divisions: DivisionCreate[]): Promise<void> {
    await this.service.createDivisions(divisions)
  }
}
