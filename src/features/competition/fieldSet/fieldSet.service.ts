import { Injectable, Logger } from '@nestjs/common'
import { FieldSetPublisher } from './fieldSet.publisher'

@Injectable()
export class FieldSetService {
  private readonly logger = new Logger(FieldSetService.name)
  constructor (private readonly publisher: FieldSetPublisher) {}

  onApplicationBootstrap (): void {
    void this.publisher.publishFieldSet('1', { currentField: '1' })
  }
}
