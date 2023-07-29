import { Test, TestingModule } from '@nestjs/testing'
import { StageService } from './stage.service'
import { EVENT_STAGE } from '@18x18az/rosetta'
import { StorageService } from '../../utils/storage/storage.service'
import { PublishService } from '../../utils/publish/publish.service'

describe('StageService', () => {
  let service: StageService

  const mockStorageService = {
    getPersistent: jest.fn(),
    setPersistent: jest.fn()
  }

  const mockPublishService = {
    broadcast: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageService, { provide: StorageService, useValue: mockStorageService },
        StageService, { provide: PublishService, useValue: mockPublishService }
      ]
    }).compile()

    service = module.get<StageService>(StageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('on startup', () => {
    it('should set the stage to SETUP if it is TEARDOWN', async () => {
      mockStorageService.getPersistent.mockResolvedValue(EVENT_STAGE.TEARDOWN)

      await service.onApplicationBootstrap()

      expect(mockStorageService.setPersistent).toHaveBeenCalledWith('eventStage', EVENT_STAGE.SETUP)
      expect(mockPublishService.broadcast).toHaveBeenCalledWith('eventStage', EVENT_STAGE.SETUP)
    })

    it('should broadcast the current stage', async () => {
      mockStorageService.getPersistent.mockResolvedValue(EVENT_STAGE.SETUP)

      await service.onApplicationBootstrap()

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('eventStage', EVENT_STAGE.SETUP)
    })
  })

  describe('when a team list is received', () => {
    it('should set the stage to CHECKIN if it is SETUP', async () => {
      mockStorageService.getPersistent.mockResolvedValue(EVENT_STAGE.SETUP)

      await service.receivedTeams()

      expect(mockStorageService.setPersistent).toHaveBeenCalledWith('eventStage', EVENT_STAGE.CHECKIN)
      expect(mockPublishService.broadcast).toHaveBeenCalledWith('eventStage', EVENT_STAGE.CHECKIN)
    })

    it('should not change the stage if it is not SETUP', async () => {
      mockStorageService.getPersistent.mockResolvedValue(EVENT_STAGE.CHECKIN)

      await service.receivedTeams()

      expect(mockStorageService.setPersistent).not.toHaveBeenCalled()
      expect(mockPublishService.broadcast).not.toHaveBeenCalled()
    })
  })

  describe('when the stage is set', () => {
    it('should save the new stage', async () => {
      await service.setStage(EVENT_STAGE.TEARDOWN)

      expect(mockStorageService.setPersistent).toHaveBeenCalledWith('eventStage', EVENT_STAGE.TEARDOWN)
    })

    it('should broadcast the new stage', async () => {
      await service.setStage(EVENT_STAGE.TEARDOWN)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('eventStage', EVENT_STAGE.TEARDOWN)
    })
  })
})
