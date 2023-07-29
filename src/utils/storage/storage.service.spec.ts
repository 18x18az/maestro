import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from './storage.service'
import { PrismaService } from '../prisma/prisma.service'

describe('StorageService', () => {
  let service: StorageService

  const mockPrismaService = {
    genericEphemeral: {
      upsert: jest.fn(),
      findUnique: jest.fn()
    },
    genericPersistent: {
      upsert: jest.fn(),
      findUnique: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService, { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('setEphemeral', () => {
    it('should call prisma.genericEphemeral.upsert with the correct arguments', async () => {
      const ident = 'foo'
      const value = 'bar'

      await service.setEphemeral(ident, value)

      expect(mockPrismaService.genericEphemeral.upsert).toHaveBeenCalledWith({ where: { key: ident }, update: { value }, create: { key: ident, value } })
    })
  })

  describe('setPersistent', () => {
    it('should call prisma.genericPersistent.upsert with the correct arguments', async () => {
      const ident = 'foo'
      const value = 'bar'

      await service.setPersistent(ident, value)

      expect(mockPrismaService.genericPersistent.upsert).toHaveBeenCalledWith({ where: { key: ident }, update: { value }, create: { key: ident, value } })
    })
  })

  describe('getEphemeral', () => {
    it('should call prisma.genericEphemeral.findUnique with the correct arguments', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericEphemeral.findUnique.mockResolvedValue('buzz')

      await service.getEphemeral(ident, fallback)

      expect(mockPrismaService.genericEphemeral.findUnique).toHaveBeenCalledWith({ where: { key: ident } })
    })

    it('should return the value in the database if it exists', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericEphemeral.findUnique.mockResolvedValue({ value: 'buzz' })

      const output = await service.getEphemeral(ident, fallback)

      expect(output).toEqual('buzz')
    })

    it('should return the fallback value if the value in the database does not exist', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericEphemeral.findUnique.mockResolvedValue(null)

      const output = await service.getEphemeral(ident, fallback)

      expect(output).toEqual(fallback)
    })

    it('should set the fallback value in the database if the value in the database does not exist', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericEphemeral.findUnique.mockResolvedValue(null)

      await service.getEphemeral(ident, fallback)

      expect(mockPrismaService.genericEphemeral.upsert).toHaveBeenCalledWith({ where: { key: ident }, update: { value: fallback }, create: { key: ident, value: fallback } })
    })
  })

  describe('getPersistent', () => {
    it('should call prisma.genericPersistent.findUnique with the correct arguments', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericPersistent.findUnique.mockResolvedValue('buzz')

      await service.getPersistent(ident, fallback)

      expect(mockPrismaService.genericPersistent.findUnique).toHaveBeenCalledWith({ where: { key: ident } })
    })

    it('should return the value in the database if it exists', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericPersistent.findUnique.mockResolvedValue({ value: 'buzz' })

      const output = await service.getPersistent(ident, fallback)

      expect(output).toEqual('buzz')
    })

    it('should return the fallback value if the value in the database does not exist', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericPersistent.findUnique.mockResolvedValue(null)

      const output = await service.getPersistent(ident, fallback)

      expect(output).toEqual(fallback)
    })

    it('should set the fallback value in the database if the value in the database does not exist', async () => {
      const ident = 'foo'
      const fallback = 'bar'
      mockPrismaService.genericPersistent.findUnique.mockResolvedValue(null)

      await service.getPersistent(ident, fallback)

      expect(mockPrismaService.genericPersistent.upsert).toHaveBeenCalledWith({ where: { key: ident }, update: { value: fallback }, create: { key: ident, value: fallback } })
    })
  })
})
