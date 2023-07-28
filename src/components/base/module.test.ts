import { IDENTIFIER, MOCK_DOUBLE_UPDATE, MOCK_RETURN_VALUE, MOCK_SECOND_RETURN_VALUE, MOCK_SECOND_UPDATE, MOCK_SINGLE_UPDATE, MOCK_VALUE_1, MOCK_VALUE_2, MockInput } from '../../__test__/mockValues'
import { DataHolder, MultiModule, SingleModule } from './module'

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
    jest.resetAllMocks()
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

  describe('load function', () => {
    const mockOutput = jest.fn()
    const mockLoadFunction = jest.fn()

    beforeEach(async () => {
      mockLoadFunction.mockReturnValue(MOCK_RETURN_VALUE)
      module.addOutput(mockOutput)
      await module.registerLoadFunction(mockLoadFunction)
    })

    test('should call it immediately after being registered', () => {
      expect(mockLoadFunction).toBeCalledTimes(1)
    })

    test('should be provided with the instance identifier', () => {
      expect(mockLoadFunction.mock.lastCall[0]).toEqual(IDENTIFIER)
    })

    test('should cause the output function to be called', () => {
      expect(mockOutput).toBeCalledTimes(1)
    })

    test('should set the output to the returned value', () => {
      expect(mockOutput.mock.lastCall[1]).toEqual(MOCK_RETURN_VALUE)
    })
  })
})

describe('MultiModule', () => {
  let module: MultiModule<MockInput, any>
  const mockProcessor = jest.fn()
  const mockOutput = jest.fn()

  const FIRST_IDENTIFIER = 'ONE'
  const SECOND_IDENTIFIER = 'TWO'

  beforeEach(() => {
    module = new MultiModule(mockProcessor)
    module.addOutput(mockOutput)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('on initializing', () => {
    test('should have no instances', () => {
      expect(module.instances.size).toEqual(0)
    })
  })

  describe('on creating a new instance', () => {
    beforeEach(async () => {
      await module.createInstance(FIRST_IDENTIFIER)
    })
    test('should create a new data holder', () => {
      expect(module.instances.get(FIRST_IDENTIFIER)).toBeInstanceOf(DataHolder)
    })

    test('should use the passed identifier', () => {
      expect(module.instances.get(FIRST_IDENTIFIER)?.identifier).toEqual(FIRST_IDENTIFIER)
    })

    test('should be able to create multiple instances', async () => {
      await module.createInstance(SECOND_IDENTIFIER)
      expect(module.instances.size).toEqual(2)
    })

    test('should return the created instance', async () => {
      const result = await module.createInstance(SECOND_IDENTIFIER)
      expect(result?.identifier).toEqual(SECOND_IDENTIFIER)
    })

    test('should return undefined if an instance with that identifier already exists', async () => {
      const result = await module.createInstance(FIRST_IDENTIFIER)
      expect(result).toBe(undefined)
    })
  })

  describe('with a single instance', () => {
    beforeEach(async () => {
      await module.createInstance(FIRST_IDENTIFIER)
    })

    test('should call the processor once on update all', async () => {
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockProcessor).toBeCalledTimes(1)
    })

    test('should call the processor once on update single', async () => {
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(mockProcessor).toBeCalledTimes(1)
    })

    test('should call the output function once on an update all', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput).toBeCalledTimes(1)
    })

    test('should call the output function once on an update single', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(mockOutput).toBeCalledTimes(1)
    })
  })

  describe('with two instances', () => {
    beforeEach(async () => {
      await module.createInstance(FIRST_IDENTIFIER)
      await module.createInstance(SECOND_IDENTIFIER)
    })

    test('should call the processor twice on update all', async () => {
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockProcessor).toBeCalledTimes(2)
    })

    test('should call the processor once on update single', async () => {
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(mockProcessor).toBeCalledTimes(1)
    })

    test('should call the output function twice on an update all', async () => {
      mockProcessor.mockReturnValue(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockOutput).toBeCalledTimes(2)
    })

    test('should call the output function once on an update single', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(mockOutput).toBeCalledTimes(1)
    })
  })

  describe('on update', () => {
    beforeEach(async () => {
      await module.createInstance(FIRST_IDENTIFIER)
    })

    test('should return true if the instance exists and the processor returns a value', async () => {
      mockProcessor.mockReturnValue(MOCK_RETURN_VALUE)
      const result = await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(result).toBeTruthy()
    })

    test('should return false if the instance exists and the processor returns undefined', async () => {
      mockProcessor.mockReturnValue(undefined)
      const result = await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(result).toBeFalsy()
    })

    test('should return false if the instance does not exist even if the processor would return a value', async () => {
      mockProcessor.mockReturnValue(MOCK_RETURN_VALUE)
      const result = await module.updateInstance(SECOND_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(result).toBeFalsy()
    })

    test('should provide the output function with the identifier and the output value', async () => {
      mockProcessor.mockReturnValue(MOCK_RETURN_VALUE)
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      const outputArguments = mockOutput.mock.lastCall
      expect(outputArguments[0]).toEqual(FIRST_IDENTIFIER)
      expect(outputArguments[1]).toEqual(MOCK_RETURN_VALUE)
    })
  })

  describe('load function', () => {
    const mockLoadFunction = jest.fn()

    beforeEach(async () => {
      mockLoadFunction.mockReturnValue(MOCK_RETURN_VALUE)
      await module.createInstance(FIRST_IDENTIFIER)
      await module.registerLoadFunction(mockLoadFunction)
    })

    test('should immediately load values for any existing instances', () => {
      expect(mockOutput).toBeCalledTimes(1)
    })

    test('should be called for any subsequent new instances', async () => {
      expect(mockOutput).toBeCalledTimes(1)
      await module.createInstance(SECOND_IDENTIFIER)
      expect(mockOutput).toBeCalledTimes(2)
    })
  })

  describe('bulk outputs', () => {
    const mockBulkOutput = jest.fn()

    beforeEach(async () => {
      await module.createInstance(FIRST_IDENTIFIER)
      await module.createInstance(SECOND_IDENTIFIER)
      module.addBulkOutput(mockBulkOutput)
    })

    test('should be called once on an update all', async () => {
      mockProcessor.mockReturnValue(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockBulkOutput).toBeCalledTimes(1)
    })

    test('should be called once on an update individual', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(mockBulkOutput).toBeCalledTimes(1)
    })

    test('should be provided with information on all instances', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      const results = mockBulkOutput.mock.lastCall[0]
      expect(results.length).toEqual(2)
    })

    test('should not be called if the processor returns false on update all', async () => {
      await module.updateInstance(FIRST_IDENTIFIER, MOCK_SINGLE_UPDATE)
      expect(mockBulkOutput).not.toBeCalled()
    })

    test('should not be called if the processor returns false on update single', async () => {
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockBulkOutput).not.toBeCalled()
    })

    test('should be called even if only one processor updates on update all', async () => {
      mockProcessor.mockReturnValueOnce(MOCK_RETURN_VALUE)
      await module.updateAll(MOCK_SINGLE_UPDATE)
      expect(mockBulkOutput).toBeCalledTimes(1)
    })
  })
})
