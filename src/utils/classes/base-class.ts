import { Logger } from '@nestjs/common'

export abstract class BaseClass {
  protected readonly logger: Logger = new Logger(this.constructor.name)
}
