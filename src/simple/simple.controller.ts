import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { IsUrl } from 'class-validator'
import { SimpleService } from './simple.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'

class TmBody {
  @IsUrl()
    addr: string
}

@Controller()
export class SimpleController {
  constructor (private readonly service: SimpleService) {}

  @Post('tmIp')
  async getTmpIp (@Body() body: TmBody): Promise<void> {
    await this.service.connectTm(body.addr)
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
}
