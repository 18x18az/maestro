import { Injectable, Logger } from '@nestjs/common'
import mockTeamList from './mockTeam'
import mockDivision from './mockDivision'
import mockMatches from './mockMatches'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

@Injectable()
export class MockService {
  private readonly logger = new Logger(MockService.name)

  constructor (private readonly httpService: HttpService) { }

  private async sendRequest (url: string, data: any): Promise<void> {
    await firstValueFrom(
      this.httpService.post(url, data).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(error)
          return await Promise.resolve()
        })
      )
    )
  }

  async generate (): Promise<void> {
    this.logger.log('Generating mock data')
    await this.sendRequest('http://localhost/api/teams', mockTeamList)
    await this.sendRequest('http://localhost/api/division', mockDivision)
    await this.sendRequest('http://localhost/api/qualSchedule', mockMatches)
  }
}
