import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchResult, STAGE } from './simple.interface'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { parseQualResults } from './results.parser'
import { StorageService } from '@/utils/storage/storage.service'
import { teamParser } from './teamParser'
import { SimplePublisher } from './simple.publisher'
import { StageService } from './stage.service'

@Injectable()
export class TmService {
  private tmAddr: string | null = null

  private readonly logger = new Logger(TmService.name)

  constructor (
    private readonly request: HttpService,
    private readonly storage: StorageService,
    private readonly publisher: SimplePublisher,
    private readonly stage: StageService
  ) {}

  async getMatchResults (): Promise<MatchResult[] | null> {
    if (this.tmAddr === null) {
      throw new Error('TM address not set')
    }

    const url = `http://${this.tmAddr}/division1/matches`
    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(`Error connecting to ${this.tmAddr as string}: ${error.message}`)
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      this.logger.warn(`TM at ${this.tmAddr} is not responding`)
      return null
    }

    const results = parseQualResults(data)
    return results
  }

  async load (): Promise<void> {
    let addr = this.tmAddr
    if (addr === null) {
      addr = await this.storage.getEphemeral('tmAddr', '')
      if (addr === '') throw new Error('No TM address found')
      this.tmAddr = addr
    }

    this.logger.log(`Loading TM at ${addr}`)

    await this.getTeams(addr)
  }

  private async getTeams (addr: string): Promise<void> {
    const url = `http://${addr}/division1/teams`
    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(`Error connecting to ${addr}: ${error.message}`)
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      throw new BadRequestException(`TM at ${addr} is not responding`)
    }

    const teams = teamParser(data)

    if (teams === null) {
      throw new BadRequestException(`TM at ${addr} responded badly`)
    }
    await this.publisher.publishTeams(teams)
  }

  async connectTm (addr: string): Promise<void> {
    this.logger.log(`Trying TM at ${addr}`)
    await this.getTeams(addr)
    this.tmAddr = addr
    await this.storage.setEphemeral('tmAddr', addr)
    await this.stage.setStage(STAGE.WAITING_FOR_MATCHES)
  }
}
