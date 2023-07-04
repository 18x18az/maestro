import { AedesPublishPacket } from 'aedes'
import { ModuleInstance, SingletonModule } from '../../utils/module'
import { getMessageString } from '../../utils/parser'
import { EventCode, EventStage, PathComponent, SetupStage } from '@18x18az/rosetta'
import { Request, Response } from 'express'
import { validate } from './validation'
import { publish } from './utils/publish'

class InstanceImplementation extends ModuleInstance<SetupStage> {
  async handleEventStage (stage: EventStage): Promise<void> {
    if (stage === EventStage.SETUP) {
      await this.setData(SetupStage.EVENT_CODE)
    } else {
      await this.setData(SetupStage.NONE)
    }
  }

  async handleInput (input: EventCode, res: Response): Promise<void> {
    if (this.data !== SetupStage.EVENT_CODE) {
      res.status(409).send('not in setup mode')
      return
    }

    if (input.eventCode === 'test') {
      console.log('Fake test event requested')
      await this.setData(SetupStage.DONE)
    } else if (input.eventCode === 'fake') {
      const numberToCreate = parseInt(input.tmCode)
      console.log(`Requested fake event with ${numberToCreate} teams`)
    } else {
      console.log('Actual event requested')
    }

    res.status(200).send()
  }

  async broadcastData (stage: SetupStage): Promise<void> {
    await publish(stage)
  }
}

export class SetupModule extends SingletonModule<InstanceImplementation> {
  protected createInstance (): InstanceImplementation {
    return new InstanceImplementation()
  }

  private async handleEventStage (packet: AedesPublishPacket): Promise<void> {
    const stage = getMessageString(packet) as EventStage
    await this.instance.handleEventStage(stage)
  }

  private async handleInput (req: Request, res: Response): Promise<void> {
    const input = await validate(req, res)

    if (input === undefined) {
      return
    }

    await this.instance.handleInput(input, res)
  }

  constructor () {
    super()
    this.subscribe(PathComponent.EVENT_STATE, this.handleEventStage.bind(this))
    this.handlePost(PathComponent.EVENT_CODE, this.handleInput.bind(this))
  }
}
