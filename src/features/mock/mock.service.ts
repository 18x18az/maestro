import { Injectable, Logger } from '@nestjs/common'
import mockTeamList from './mockTeam'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MockService {
  private readonly logger = new Logger(MockService.name)

  constructor (private readonly httpService: HttpService) { }

  async generate (): Promise<void> {
    this.logger.log('Generating mock data')
    await firstValueFrom(this.httpService.post('http://localhost/api/teams', mockTeamList))
  }
}
