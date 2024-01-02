import { Controller, Post, Request } from '@nestjs/common'
import { QualService } from './qual.service'

@Controller('matches')
export class MatchController {
  constructor (
    private readonly quals: QualService
  ) {}

  @Post('quals')
  async uploadMatches (@Request() request): Promise<void> {
    const multipart = request.files()
    const file = await multipart.next()
    const buffer = await file.value.toBuffer()
    const string = buffer.toString('utf-8')
    await this.quals.handleUpload(string)
  }
}
