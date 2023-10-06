import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { DivisionCreate } from './division.interface'
import { DivisionRepo } from './division.repo'

@Injectable()
export class DivisionService {
  private readonly logger: Logger = new Logger(DivisionService.name)

  constructor (private readonly repo: DivisionRepo) {}
  async createDivisions (divisions: DivisionCreate[]): Promise<void> {
    const existing = await this.repo.getDivisions()
    if (existing.length > 0) {
      this.logger.warn('Divisions already exist')
      throw new ConflictException('Divisions already exist')
    }

    this.logger.log(`Creating ${divisions.length} divisions`)
    await this.repo.createDivisions(divisions)
  }
}
