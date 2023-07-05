import { DataHolder, SingleModule } from './module'

interface MockInput {
  firstValue: string
  secondValue: string
}

const IDENTIFIER = 'TEST'

const MOCK_VALUE_1 = 'FOO'
const MOCK_VALUE_2 = 'BAR'

const MOCK_SINGLE_UPDATE: Partial<MockInput> = { firstValue: MOCK_VALUE_1 }
const MOCK_DOUBLE_UPDATE: Partial<MockInput> = { firstValue: MOCK_VALUE_1, secondValue: MOCK_VALUE_2 }
const MOCK_SECOND_UPDATE: Partial<MockInput> = { secondValue: MOCK_VALUE_2 }

describe('DataHolder', () => {
  let dataHolder: DataHolder<MockInput, any>

  beforeEach(() => {
    dataHolder = new DataHolder(IDENTIFIER)
  })

  describe('on initializing', () => {
    test('should have the passed identifier', () => {
      expect(dataHolder.identifier).toEqual(IDENTIFIER)
    })

    test('should have an undefined output', () => {
      expect(dataHolder.output).toEqual(undefined)
    })

    test('should have no inputs', () => {
      expect(Object.keys(dataHolder.inputs).length).toEqual(0)
    })
  })

  describe('applyUpdate', () => {
    test('should be able to set a single input', () => {
      dataHolder.applyUpdate(MOCK_SINGLE_UPDATE)

      expect(dataHolder.inputs.firstValue).toEqual(MOCK_VALUE_1)
    })

    test('should be able to set multiple inputs', () => {
      dataHolder.applyUpdate(MOCK_DOUBLE_UPDATE)

      expect(dataHolder.inputs.firstValue).toEqual(MOCK_VALUE_1)
      expect(dataHolder.inputs.secondValue).toEqual(MOCK_VALUE_2)
    })

    test('should retain previous inputs', () => {
      dataHolder.applyUpdate(MOCK_SINGLE_UPDATE)
      dataHolder.applyUpdate(MOCK_SECOND_UPDATE)

      expect(dataHolder.inputs.firstValue).toEqual(MOCK_VALUE_1)
      expect(dataHolder.inputs.secondValue).toEqual(MOCK_VALUE_2)
    })

    test('should be able to change the value of an input', () => {
      const secondUpdate: Partial<MockInput> = { firstValue: MOCK_VALUE_2 }
      dataHolder.applyUpdate(MOCK_SINGLE_UPDATE)
      dataHolder.applyUpdate(secondUpdate)

      expect(dataHolder.inputs.firstValue).toEqual(MOCK_VALUE_2)
    })
  })

  describe('setOutput', () => {
    test('should set the output value', () => {
      const VALUE = 'test'
      dataHolder.setOutput(VALUE)
      expect(dataHolder.output).toEqual(VALUE)
    })
  })
})

describe('SingleModule', () => {
  let module: SingleModule<MockInput, any>
  const IDENTIFIER = 'test'
  const mockProcessor = jest.fn()

  beforeEach(() => {
    module = new SingleModule(IDENTIFIER, mockProcessor)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateAll', () => {
    test('should cause the processor function to be called', async () => {
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockProcessor).toHaveBeenCalledTimes(1)
    })

    test('should only call the processor once even with a multi value update', async () => {
      await module.updateAll(MOCK_DOUBLE_UPDATE)
      expect(mockProcessor).toHaveBeenCalledTimes(1)
    })

    test('should pass the updated values to the processor', async () => {
      await module.updateAll(MOCK_SINGLE_UPDATE)
      const args = mockProcessor.mock.calls[0]
      const firstArg = args[0] as Partial<MockInput>
      const secondArg = args[1]
      expect(firstArg.firstValue).toEqual(MOCK_VALUE_1)
      expect(secondArg).toBe(undefined)
    })
  })

  describe('outputs', () => {
    const mockOutput1 = jest.fn()
    const mockOutput2 = jest.fn()
    const MOCK_RETURN_VALUE = 'FIZZ'
    const MOCK_SECOND_RETURN_VALUE = 'BUZZ'

    beforeEach(() => {
      module.addOutput(mockOutput1)
    })

    test('should not be called if the processor returns undefined', async () => {
      mockProcessor.mockReturnValueOnce(undefined)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput1).not.toBeCalled()
    })

    test('should be called if the processor returns a value', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput1).toBeCalledTimes(1)
    })

    test('should be called again if the processor returns a new value', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      mockProcessor.mockReturnValueOnce(MOCK_SECOND_RETURN_VALUE)
      await module.updateAll(MOCK_SECOND_UPDATE)
      expect(mockOutput1).toBeCalledTimes(2)
    })

    test('should not be called again if the processor returns the same value twice in a row', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput1).toBeCalledTimes(1)
    })

    test('should be called for all outputs', async () => {
      module.addOutput(mockOutput2)
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput1).toBeCalledTimes(1)
      expect(mockOutput2).toBeCalledTimes(1)
    })

    test('should be be called with the identifier and new output value', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput1).toHaveBeenLastCalledWith(IDENTIFIER, MOCK_RETURN_VALUE)
    })
  })
})
