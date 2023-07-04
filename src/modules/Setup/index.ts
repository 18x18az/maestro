import { AUTH_TYPE, EventCode, EventStage, MessagePath, PathComponent, SetupStage } from '@18x18az/rosetta'
import { BroadcastBuilder, InputProcessor, PostHandler, SingleModule, SubscribeHandler, addBroadcastOutput, addPostHandler, addSubscriber, getMessageString, postHandlerFactory } from '../../components'

const processor: InputProcessor<SetupStage> = (input, current) => {
  const eventStage = input.get(PathComponent.EVENT_STATE) as EventStage | undefined
  const code = input.get(PathComponent.EVENT_CODE) as EventCode | undefined

  if (eventStage !== undefined && eventStage !== EventStage.SETUP) {
    return SetupStage.NONE
  }

  if (current === undefined && eventStage === EventStage.SETUP) {
    return SetupStage.EVENT_CODE
  }

  if (current === SetupStage.EVENT_CODE && code !== undefined) {
    if (code.eventCode === 'test') {
      console.log('Faking teams without TM')
      return SetupStage.DONE
    }
  }
}

const setupStageHandler: SubscribeHandler = (packet) => {
  const stage = getMessageString(packet) as EventStage
  return [[PathComponent.EVENT_STATE, stage]]
}

const codeHandler: PostHandler = async (req, res) => {
  const code = req.body as EventCode
  return [[PathComponent.EVENT_CODE, code]]
}

const broadcastBuilder: BroadcastBuilder<SetupStage> = (identifier, value) => {
  const topic: MessagePath = [[], PathComponent.SETUP_STAGE]

  return [topic, value]
}

export function setupEventSetup (): void {
  const module = new SingleModule(PathComponent.SETUP_STAGE, processor)

  addSubscriber(module, [[], PathComponent.EVENT_STATE], setupStageHandler)
  addPostHandler(module, [[], PathComponent.EVENT_CODE], postHandlerFactory(codeHandler, AUTH_TYPE.LOCAL))

  addBroadcastOutput(module, broadcastBuilder)
}
