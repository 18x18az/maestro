import { getNextId, IMetadata, LogType, record } from './log'

describe('log', () => {
  describe('record', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { })

    afterAll(() => {
      logSpy.mockReset()
    })

    beforeEach(() => {
      logSpy.mockClear()
    })

    const fakeMetadata: IMetadata = { id: 5, connection: '2' }
    const fakeMessage = 'test'

    it('should console log the message in the appropriate form', () => {
      record(fakeMetadata, LogType.LOG, fakeMessage)
      expect(logSpy).toBeCalledTimes(1)
      expect(logSpy).toBeCalledWith(`LOG: ${fakeMessage} - {\"id\":${fakeMetadata.id},\"connection\":\"${fakeMetadata.connection}\"}`)
    })

    it('should console log LOG messages', () => {
      record(fakeMetadata, LogType.LOG, fakeMessage)
      expect(logSpy).toBeCalledTimes(1)
    })

    it('should console log ERROR messages', () => {
      record(fakeMetadata, LogType.ERROR, fakeMessage)
      expect(logSpy).toBeCalledTimes(1)
    })

    it('should not console log DATA messages', () => {
      record(fakeMetadata, LogType.DATA, fakeMessage)
      expect(logSpy).not.toBeCalled()
    })
  })

  describe('getNextId', () => {
    it('should get the next sequential ID', () => {
      const firstId = getNextId()
      const secondId = getNextId()
      expect(secondId - firstId).toEqual(1)
    })
  })
})
