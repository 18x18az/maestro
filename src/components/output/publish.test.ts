import { mockBroker } from '../../__test__/mockMqtt'
import { addBroadcastOutput } from './publish'
import { SingleModule } from '../base/module'
import { IDENTIFIER, MOCK_RETURN_VALUE, MOCK_SINGLE_UPDATE, MOCK_TOPIC, MockInput } from '../../__test__/mockValues'
import { makeMqttPath } from '../utils/pathBuilder'

jest.mock('../../services/mqtt', () => ({
  broker: mockBroker
}))

const mockBroadcastBuilder = jest.fn()
const mockProcessor = jest.fn()

describe('addBroadcastOutput', () => {
  let module: SingleModule<MockInput, any>
  beforeEach(() => {
    module = new SingleModule(IDENTIFIER, mockProcessor)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  it('should add an output function to the module', () => {
    jest.spyOn(SingleModule.prototype, 'addOutput')
    addBroadcastOutput(module, mockBroadcastBuilder)
    expect(module.addOutput).toHaveBeenCalledTimes(1)
  })
})

describe('publish', () => {
  let module: SingleModule<MockInput, any>
  beforeEach(() => {
    module = new SingleModule(IDENTIFIER, mockProcessor)
    mockBroadcastBuilder.mockReturnValue([MOCK_TOPIC, MOCK_RETURN_VALUE])
    addBroadcastOutput(module, mockBroadcastBuilder)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should publish the message to the broker', async () => {
    mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
    await module.updateAll(MOCK_SINGLE_UPDATE)
    const expectedTopicString = makeMqttPath(MOCK_TOPIC)
    const expectedPayload = JSON.stringify(MOCK_RETURN_VALUE)
    expect(mockBroker.publish).toHaveBeenCalledTimes(1)
    expect(mockBroker.publish).toHaveBeenCalledWith({
      topic: expectedTopicString,
      payload: expectedPayload,
      cmd: 'publish',
      qos: 2,
      dup: false,
      retain: true
    }, expect.any(Function))
  }
  )
})
