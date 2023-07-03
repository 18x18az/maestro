import { AedesPublishPacket } from 'aedes'
import { ModuleInstance, SingletonModule } from '../../utils/module'
import { getMessageString } from '../../utils/parser'
import { EventStage, SetupStage } from '@18x18az/rosetta'
import { Request, Response } from 'express'
import { validate } from './validations'
import { publish } from './utils/publish'

class InstanceImplementation extends ModuleInstance {
  private stage!: SetupStage

  private async handleEventStage (packet: AedesPublishPacket): Promise<void> {
    const stage = getMessageString(packet) as EventStage
    if (stage === EventStage.SETUP) {
      await this.setStage(SetupStage.EVENT_CODE)
    } else {
      await this.setStage(SetupStage.NONE)
    }
  }

  private async handleInput (req: Request, res: Response): Promise<void> {
    const input = await validate(req, res)

    if (input === undefined) {
      return
    }

    if (this.stage !== SetupStage.EVENT_CODE) {
      res.status(409).send('not in setup mode')
      return
    }

    if (input.eventCode === 'test') {
      console.log('Fake test event requested')
      await this.setStage(SetupStage.DONE)
    } else if (input.eventCode === 'fake') {
      const numberToCreate = parseInt(input.tmCode)
      console.log(`Requested fake event with ${numberToCreate} teams`)
    } else {
      console.log('Actual event requested')
    }

    res.status(200).send()
  }

  private async setStage (stage: SetupStage): Promise<void> {
    if (stage !== this.stage) {
      this.stage = stage
      await publish(stage)
    }
  }

  constructor () {
    super()
    this.subscribe('stage', this.handleEventStage.bind(this))
    this.handlePost('eventCode', this.handleInput.bind(this))
  }
}

export class SetupModule extends SingletonModule<InstanceImplementation> {
  protected createInstance (): InstanceImplementation {
    return new InstanceImplementation()
  }
}
