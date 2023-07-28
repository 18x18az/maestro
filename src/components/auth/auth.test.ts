import { AUTH_TYPE } from '@18x18az/rosetta'
import { isAuthorized } from './auth'
import { Request } from 'express'

const mockLocalRequest: Request = { ip: '::1' } as any
const mockNonLocalRequest: Request = { ip: '192.168.1.10' } as any

describe('isAuthorized', () => {
  describe('local auth type', () => {
    it('should return true if the source is localhost', async () => {
      const result = await isAuthorized(mockLocalRequest, AUTH_TYPE.LOCAL)
      expect(result).toBe(true)
    })

    it('should return false if the source is not localhost', async () => {
      const result = await isAuthorized(mockNonLocalRequest, AUTH_TYPE.LOCAL)
      expect(result).toBe(false)
    })
  })

  describe('admin auth type', () => {
    it('should return true if the source is localhost', async () => {
      const result = await isAuthorized(mockLocalRequest, AUTH_TYPE.ADMIN)
      expect(result).toBe(true)
    })

    it('should return false if the source is not localhost', async () => {
      const result = await isAuthorized(mockNonLocalRequest, AUTH_TYPE.ADMIN)
      expect(result).toBe(false)
    })
  })
})
