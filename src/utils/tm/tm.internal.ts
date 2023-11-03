import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { parse, HTMLElement } from 'node-html-parser'
import { TeamInformation } from './tm.interface'
import { TmPublisher } from './tm.publisher'

const STORAGE_KEY = 'tm'

@Injectable()
export class TmInternal {
  private readonly logger = new Logger(TmInternal.name)

  private tmAddr: string

  constructor (
    private readonly request: HttpService,
    private readonly storage: StorageService,
    private readonly publisher: TmPublisher
  ) { }

  async onModuleInit (): Promise<void> {
    const loaded = await this.storage.getEphemeral(STORAGE_KEY, '')

    if (loaded === '') {
      this.logger.warn('TM address not set')
    }

    const isUp = await this.tryAddress(loaded)

    if (!isUp) {
      this.logger.warn(`Could not connect to TM at ${loaded}`)
      return
    }

    this.tmAddr = loaded
    this.logger.log(`Connected to TM at ${loaded}`)
    await this.loadTeams()
  }

  private async tryAddress (addr: string): Promise<boolean> {
    const url = `http://${addr}`
    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(`Error connecting to ${this.tmAddr}: ${error.message}`)
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      this.logger.warn(`TM at ${this.tmAddr} is not responding`)
      return false
    }

    const page = parse(data)
    const title = page.querySelector('title')
    if (title === null) {
      this.logger.warn(`Resource at ${this.tmAddr} does not appear to be TM`)
      return false
    }

    const text = title.rawText

    if (!text.startsWith('Team List')) {
      this.logger.warn(`Resource at ${this.tmAddr} does not appear to be TM`)
      return false
    }

    return true
  }

  private async getData (resource: string): Promise<HTMLElement | null> {
    if (this.tmAddr === null) {
      throw new Error('TM address not set')
    }

    const url = `http://${this.tmAddr}/${resource}`

    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async (error: AxiosError) => {
          this.logger.log(`Error connecting to ${this.tmAddr}: ${error.message}`)
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      this.logger.warn(`TM at ${this.tmAddr} is not responding`)
      return null
    }

    const page = parse(data)

    return page
  }

  async getTableData (resource: string): Promise<HTMLElement[] | null> {
    const page = await this.getData(resource)

    if (page === null) {
      return null
    }

    const table = page.querySelector('table')
    if (table === null) {
      return null
    }

    const rows = table.querySelectorAll('tr')
    if (rows.length === 0) {
      return null
    }

    return rows
  }

  private async loadTeams (): Promise<void> {
    const rows = await this.getTableData('division1/teams')
    if (rows === null) return

    const teams: TeamInformation[] = rows.flatMap(row => {
      const cells = row.querySelectorAll('td')
      const test = cells[0]

      if (test === undefined) {
        return []
      }

      const number = test.rawText
      const name = cells[1].rawText
      const location = cells[2].rawText
      const school = cells[3].rawText

      const team = { number, name, location, school }
      return team
    })

    this.logger.log(`Got ${teams.length} teams`)
    await this.publisher.publishTeams(teams)
  }

  async setAddress (addr: string): Promise<void> {
    this.logger.log(`Trying TM at ${addr}`)
    const isValid = await this.tryAddress(addr)

    if (!isValid) {
      throw new BadRequestException('Invalid TM address')
    }

    this.logger.log(`Connected to TM at ${addr}`)
    this.tmAddr = addr
    await this.storage.setEphemeral(STORAGE_KEY, addr)
    await this.loadTeams()
  }
}
