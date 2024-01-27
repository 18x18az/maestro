import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'

interface TableEmptyPayload {
  fieldId: number
}

@Injectable()
export class TableEmptyEvent extends EventService<TableEmptyPayload, TableEmptyPayload, TableEmptyPayload> {
  protected async doExecute (data: TableEmptyPayload): Promise<TableEmptyPayload> {
    return data
  }
}
