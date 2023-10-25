import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { IsUrl } from 'class-validator'
import { SimpleService } from './simple.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import { MatchLifecycleService } from './match-lifecycle.service'
import { TmService } from './tm-service'

class TmBody {
  @IsUrl()
    addr: string
}

@Controller()
export class SimpleController {
  constructor (
    private readonly service: SimpleService,
    private readonly lifecycle: MatchLifecycleService,
    private readonly tm: TmService
  ) {}

  @Post('tmIp')
  async getTmpIp (@Body() body: TmBody): Promise<void> {
    await this.tm.connectTm(body.addr)
  }

  @Post('uploadMatches')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMatches (@UploadedFile() file: Express.Multer.File): Promise<void> {
    const data = file.buffer.toString()
    await this.service.handleQualListUpload(data)
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.service.reset()
  }

  @Post('continue')
  async continue (): Promise<void> {
    await this.service.continue()
  }

  @Post('start')
  async start (): Promise<void> {
    await this.lifecycle.onAutoStarted()
  }

  @Post('resume')
  async resume (): Promise<void> {
    await this.lifecycle.onMatchResumed()
  }
}
