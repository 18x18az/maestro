import { Test, TestingModule } from '@nestjs/testing'
import { StageService } from './stage.service'
import { StorageService } from '../../utils/storage/storage.service'
import { EVENT_STAGE } from './stage.interface'
import { StagePublisher } from './stage.publisher'
import { ResetRepo } from './reset.repo'

describe('StageService', () => {
  let service: StageService

  const mockStorageService = {
    getPersistent: jest.fn(),
    setPersistent: jest.fn()
  }

  const mockPublishService = {
    publishStage: jest.fn()
  }

  const mockRepoService = {
    reset: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageService, { provide: StorageService, useValue: mockStorageService },
        StageService, { provide: StagePublisher, useValue: mockPublishService },
        StageService, { provide: ResetRepo, useValue: mockRepoService }
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
      expect(mockPublishService.publishStage).toHaveBeenCalledWith({ stage: EVENT_STAGE.SETUP })
    })

    it('should broadcast the current stage', async () => {
      mockStorageService.getPersistent.mockResolvedValue(EVENT_STAGE.SETUP)

      await service.onApplicationBootstrap()

      expect(mockPublishService.publishStage).toHaveBeenCalledWith({ stage: EVENT_STAGE.SETUP })
    })
  })

  describe('when a team list is received', () => {
    it('should set the stage to CHECKIN if it is SETUP', async () => {
      mockStorageService.getPersistent.mockResolvedValue(EVENT_STAGE.SETUP)

      await service.receivedTeams()

      expect(mockStorageService.setPersistent).toHaveBeenCalledWith('eventStage', EVENT_STAGE.CHECKIN)
      expect(mockPublishService.publishStage).toHaveBeenCalledWith({ stage: EVENT_STAGE.CHECKIN })
    })

    it('should not change the stage if it is not SETUP', async () => {
      mockStorageService.getPersistent.mockResolvedValue({ stage: EVENT_STAGE.CHECKIN })

      await service.receivedTeams()

      expect(mockStorageService.setPersistent).not.toHaveBeenCalled()
      expect(mockPublishService.publishStage).not.toHaveBeenCalled()
    })
  })

  describe('when the stage is set', () => {
    it('should save the new stage', async () => {
      await service.setStage(EVENT_STAGE.TEARDOWN)

      expect(mockStorageService.setPersistent).toHaveBeenCalledWith('eventStage', EVENT_STAGE.TEARDOWN)
    })

    it('should broadcast the new stage', async () => {
      await service.setStage(EVENT_STAGE.TEARDOWN)

      expect(mockPublishService.publishStage).toHaveBeenCalledWith({ stage: EVENT_STAGE.TEARDOWN })
    })
  })
})
