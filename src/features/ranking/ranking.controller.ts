import { Controller, Post, Request } from '@nestjs/common'
import { RankingsUpdateEvent } from './ranking-update.event'

@Controller('rankings')
export class RankingController {
  constructor (
    private readonly event: RankingsUpdateEvent
  ) {}

  @Post()
  async uploadRankings (@Request() request): Promise<void> {
    const multipart = request.files()
    const file = await multipart.next()
    const buffer = await file.value.toBuffer()
    const string = buffer.toString('utf-8')
    const rankings = string.split('\n').slice(1, -1).map(line => line.split(',')[1])
    await this.event.execute({ rankings })
  }
}
