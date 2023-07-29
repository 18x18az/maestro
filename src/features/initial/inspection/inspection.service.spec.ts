import { Test, TestingModule } from '@nestjs/testing'
import { InspectionService } from './inspection.service'
import { PublishService } from 'src/utils/publish/publish.service'
import { InspectionDatabase } from './repo.service'
import { EVENT_STAGE, INSPECTION_STAGE, InspectionSummary } from '@18x18az/rosetta'
import { InspectionChecklist } from './inspection.dto'

describe('InspectionService', () => {
  let service: InspectionService

  const mockPublishService = {
    broadcast: jest.fn()
  }

  const mockInspectionDatabase = {
    initialLoad: jest.fn(),
    getTeamsByStage: jest.fn(),
    markCheckinStage: jest.fn(),
    getStage: jest.fn(),
    markMetOrNot: jest.fn(),
    getInspectionChecklist: jest.fn(),
    getCriteriaMet: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionService, {
          provide: PublishService,
          useValue: mockPublishService
        },
        InspectionService, {
          provide: InspectionDatabase,
          useValue: mockInspectionDatabase
        }
      ]
    }).compile()

    service = module.get<InspectionService>(InspectionService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('on receiving a team list', () => {
    it('should get the current inspection status of each team', async () => {
      mockInspectionDatabase.getTeamsByStage.mockImplementation((stage: INSPECTION_STAGE) => {
        return []
      })

      await service.loadTeams(['1', '2'])

      expect(mockInspectionDatabase.initialLoad).toHaveBeenCalledTimes(2)
      expect(mockInspectionDatabase.initialLoad).toHaveBeenCalledWith('1')
      expect(mockInspectionDatabase.initialLoad).toHaveBeenCalledWith('2')
    })

    it('should broadcast the inspection status of each team', async () => {
      mockInspectionDatabase.getTeamsByStage.mockImplementation((stage: INSPECTION_STAGE) => {
        return []
      })
      mockInspectionDatabase.initialLoad.mockResolvedValueOnce(INSPECTION_STAGE.NO_SHOW).mockResolvedValueOnce(INSPECTION_STAGE.NOT_HERE)

      await service.loadTeams(['1', '2'])

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/team/1', INSPECTION_STAGE.NO_SHOW)
      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/team/2', INSPECTION_STAGE.NOT_HERE)
    })

    it('should broadcast the inspection status of each stage', async () => {
      mockInspectionDatabase.getTeamsByStage.mockImplementation((stage: INSPECTION_STAGE) => {
        if (stage === INSPECTION_STAGE.NO_SHOW) {
          return ['1', '2']
        }
        return []
      })
      mockInspectionDatabase.initialLoad.mockResolvedValueOnce(INSPECTION_STAGE.NO_SHOW).mockResolvedValueOnce(INSPECTION_STAGE.NOT_HERE)

      await service.loadTeams(['1', '2'])

      expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${INSPECTION_STAGE.NO_SHOW as string}`, { teams: ['1', '2'] })
      expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${INSPECTION_STAGE.NOT_HERE as string}`, { teams: [] })
    })

    it('should broadcast the individual inspection status of each team', async () => {
      mockInspectionDatabase.getTeamsByStage.mockImplementation((stage: INSPECTION_STAGE) => [])
      mockInspectionDatabase.initialLoad.mockResolvedValueOnce(INSPECTION_STAGE.NO_SHOW).mockResolvedValueOnce(INSPECTION_STAGE.NOT_HERE)

      await service.loadTeams(['1', '2'])

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/team/1', INSPECTION_STAGE.NO_SHOW)
      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/team/2', INSPECTION_STAGE.NOT_HERE)
    })
  })

  describe('on receiving a checkin stage', () => {
    it('should update the inspection status of the team', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)

      await service.markCheckinStage('1', INSPECTION_STAGE.NO_SHOW)

      expect(mockInspectionDatabase.markCheckinStage).toHaveBeenCalledWith('1', INSPECTION_STAGE.NO_SHOW)
    })

    it('should throw an error if the event is not in the checkin stage', async () => {
      service.setEventStage(EVENT_STAGE.EVENT)

      await expect(service.markCheckinStage('1', INSPECTION_STAGE.NO_SHOW)).rejects.toThrowError('Check in closed')
    })
  })

  describe('on receiving an inspection status', () => {
    it('should update the inspection status of the team for a met criteria', async () => {
      await service.markMetOrNot('1', 1, true)

      expect(mockInspectionDatabase.markMetOrNot).toHaveBeenCalledWith('1', 1, true)
    })

    it('should update the inspection status of the team for a not met criteria', async () => {
      await service.markMetOrNot('1', 1, false)

      expect(mockInspectionDatabase.markMetOrNot).toHaveBeenCalledWith('1', 1, false)
    })

    it('should handle a change in inspection status', async () => {
      mockInspectionDatabase.markMetOrNot.mockResolvedValueOnce(INSPECTION_STAGE.PARTIAL)

      await service.markMetOrNot('1', 1, false)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/team/1', INSPECTION_STAGE.PARTIAL)
    })

    it('should throw an error if the team is not checked in', async () => {
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.NOT_HERE)

      await expect(service.markMetOrNot('1', 1, true)).rejects.toThrowError('Team not checked in')
    })
  })

  describe('on receiving a change in inspection status', () => {
    it('should broadcast the updated list of teams in its old stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockInspectionDatabase.getTeamsByStage.mockImplementation((stage: INSPECTION_STAGE) => {
        if (stage === INSPECTION_STAGE.NOT_HERE) {
          return ['2']
        }
        return []
      })
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.NOT_HERE)

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${INSPECTION_STAGE.NOT_HERE as string}`, { teams: ['2'] })
    })

    it('should broadcast the updated list of teams in its new stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockInspectionDatabase.getTeamsByStage.mockImplementation((stage: INSPECTION_STAGE) => {
        if (stage === INSPECTION_STAGE.CHECKED_IN) {
          return ['1', '2']
        }
        return []
      })
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.NOT_HERE)
      mockInspectionDatabase.markCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.CHECKED_IN)

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${INSPECTION_STAGE.CHECKED_IN as string}`, { teams: ['1', '2'] })
    })

    it('should do nothing if the new stage is the same as the old stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.CHECKED_IN)
      mockInspectionDatabase.markCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.CHECKED_IN)

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockPublishService.broadcast).not.toHaveBeenCalled()
    })

    it('should broadcast that checkin can conclude if the last team leaves the NOT_HERE stage', async () => {
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.NOT_HERE)
      mockInspectionDatabase.markCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.CHECKED_IN)
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockInspectionDatabase.getTeamsByStage.mockReturnValue([])

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/canConclude', true)
    })

    it('should broadcast that checkin cannot conclude if a team reenters the NOT_HERE stage', async () => {
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.NOT_HERE)
      mockInspectionDatabase.markCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.CHECKED_IN)
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockInspectionDatabase.getTeamsByStage.mockReturnValue([])
      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.CHECKED_IN)
      mockInspectionDatabase.markCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.NOT_HERE)
      mockInspectionDatabase.getTeamsByStage.mockReturnValue(['1'])

      await service.markCheckinStage('1', INSPECTION_STAGE.NOT_HERE)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/canConclude', false)
    })
  })

  describe('get team progress', () => {
    it('should return the inspection progress of a team', async () => {
      const mockInspectionChecklist: InspectionChecklist = {
        group1: [
          { text: 'criteria1', uuid: 1 },
          { text: 'criteria2', uuid: 2 }
        ]
      }
      const mockInspectionMet = [1]
      const expectedSummary: InspectionSummary = [
        {
          text: 'group1',
          criteria: [
            { text: 'criteria1', met: true, uuid: 1 },
            { text: 'criteria2', met: false, uuid: 2 }
          ]
        }
      ]
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.PARTIAL)
      mockInspectionDatabase.getInspectionChecklist.mockResolvedValueOnce(mockInspectionChecklist)
      mockInspectionDatabase.getCriteriaMet.mockResolvedValueOnce(mockInspectionMet)

      const result = await service.getTeamProgress('1')

      expect(result).toEqual(expectedSummary)
    })

    it('should throw an error if the team is not checked in', async () => {
      mockInspectionDatabase.getStage.mockReturnValueOnce(INSPECTION_STAGE.NOT_HERE)

      await expect(service.getTeamProgress('1')).rejects.toThrowError('Team not checked in')
    })
  })
})
