import { EventService } from './event-service'

interface TestContext {
  foo: string
}

interface AdditionalContext extends TestContext {
  bar: string
}

class SimpleEventService extends EventService<TestContext, TestContext> {
  doExecute = jest.fn()
}

class AdditionalContextEventService extends EventService<TestContext, AdditionalContext> {
  doExecute = jest.fn()
  getContext = async (context: TestContext): Promise<AdditionalContext> => await Promise.resolve({ ...context, bar: 'baz' })
}

describe('EventService', () => {
  let service: SimpleEventService
  const data = { foo: 'bar' }
  beforeEach(() => {
    jest.clearAllMocks()
    service = new SimpleEventService()
  })

  describe('doExecute', () => {
    it('should be called', async () => {
      await service.execute(data)
      expect(service.doExecute).toBeCalledTimes(1)
    })

    it('should receive the provided data if getContext is not overridden', async () => {
      await service.execute(data)
      expect(service.doExecute).toBeCalledWith(data)
    })

    it('should receive additional context if getContext is overridden', async () => {
      const contextService = new AdditionalContextEventService()
      await contextService.execute(data)
      expect(contextService.doExecute).toBeCalledWith({ ...data, bar: 'baz' })
    })
  })

  describe('registerBefore', () => {
    it('should be called', async () => {
      const callback = jest.fn()
      service.registerBefore(callback)
      await service.execute(data)
      expect(callback).toBeCalledTimes(1)
    })

    it('should support multiple callbacks', async () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      service.registerBefore(callback1)
      service.registerBefore(callback2)
      await service.execute(data)
      expect(callback1).toBeCalledTimes(1)
      expect(callback2).toBeCalledTimes(1)
    })

    it('should receive the provided data if getContext is not overridden', async () => {
      const callback = jest.fn()
      service.registerBefore(callback)
      await service.execute(data)
      expect(callback).toBeCalledWith(data)
    })

    it('should receive additional context if getContext is overridden', async () => {
      const callback = jest.fn()
      const contextService = new AdditionalContextEventService()
      contextService.registerBefore(callback)
      await contextService.execute(data)
      expect(callback).toBeCalledWith({ ...data, bar: 'baz' })
    })
  })

  describe('registerAfter', () => {
    it('should be called', async () => {
      const callback = jest.fn()
      service.registerAfter(callback)
      await service.execute(data)
      expect(callback).toBeCalledTimes(1)
    })

    it('should support multiple callbacks', async () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      service.registerAfter(callback1)
      service.registerAfter(callback2)
      await service.execute(data)
      expect(callback1).toBeCalledTimes(1)
      expect(callback2).toBeCalledTimes(1)
    })

    it('should receive the provided data if getContext is not overridden', async () => {
      const callback = jest.fn()
      service.registerAfter(callback)
      await service.execute(data)
      expect(callback).toBeCalledWith(data)
    })

    it('should receive additional context if getContext is overridden', async () => {
      const callback = jest.fn()
      const contextService = new AdditionalContextEventService()
      contextService.registerAfter(callback)
      await contextService.execute(data)
      expect(callback).toBeCalledWith({ ...data, bar: 'baz' })
    })
  })

  describe('registerOnComplete', () => {
    it('should be called', async () => {
      const callback = jest.fn()
      service.registerOnComplete(callback)
      await service.execute(data)
      expect(callback).toBeCalledTimes(1)
    })

    it('should support multiple callbacks', async () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      service.registerOnComplete(callback1)
      service.registerOnComplete(callback2)
      await service.execute(data)
      expect(callback1).toBeCalledTimes(1)
      expect(callback2).toBeCalledTimes(1)
    })

    it('should receive the provided data if getContext is not overridden', async () => {
      const callback = jest.fn()
      service.registerOnComplete(callback)
      await service.execute(data)
      expect(callback).toBeCalledWith(data)
    })

    it('should receive additional context if getContext is overridden', async () => {
      const callback = jest.fn()
      const contextService = new AdditionalContextEventService()
      contextService.registerOnComplete(callback)
      await contextService.execute(data)
      expect(callback).toBeCalledWith({ ...data, bar: 'baz' })
    })
  })

  describe('execution order', () => {
    it('should execute before callbacks before the event', async () => {
      const callback = jest.fn()
      service.registerBefore(callback)
      await service.execute(data)
      const beforeCallbackIndex = callback.mock.invocationCallOrder[0]
      const doExecuteIndex = service.doExecute.mock.invocationCallOrder[0]
      expect(beforeCallbackIndex).toBeLessThan(doExecuteIndex)
    })

    it('should not execute the event before the before callbacks have completed', async () => {
      const callback = jest.fn()
      service.registerBefore(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        callback()
      })

      await service.execute(data)
      expect(callback).toBeCalledTimes(1)
      expect(service.doExecute).toBeCalledTimes(1)
    })

    it('should execute after callbacks after the event', async () => {
      const callback = jest.fn()
      service.registerAfter(callback)
      await service.execute(data)
      const afterCallbackIndex = callback.mock.invocationCallOrder[0]
      const doExecuteIndex = service.doExecute.mock.invocationCallOrder[0]
      expect(afterCallbackIndex).toBeGreaterThan(doExecuteIndex)
    })

    it('should execute complete callbacks last', async () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      service.registerAfter(callback1)
      service.registerOnComplete(callback2)
      await service.execute(data)
      const afterCallbackIndex = callback1.mock.invocationCallOrder[0]
      const completeCallbackIndex = callback2.mock.invocationCallOrder[0]
      expect(completeCallbackIndex).toBeGreaterThan(afterCallbackIndex)
    })
  })
})
