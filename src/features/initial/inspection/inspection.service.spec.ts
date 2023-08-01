import { Test, TestingModule } from '@nestjs/testing'
import { InspectionService } from './inspection.service'
import { EVENT_STAGE, INSPECTION_STAGE } from '@18x18az/rosetta'
import { InspectionChecklist } from './inspection.dto'
import { PublishService } from '../../../utils/publish/publish.service'
import { TeamModel } from './models/team.model'
import { OverallModel } from './models/overall.model'
import { makeExpectedSummary, mockInspectionChecklist, partialMet } from './__test__/consts'
import { expectGroupBroadcast, expectTeamBroadcast } from './__test__/expects'
import { mockPublishService } from '../../../utils/publish/__test__/publish.service.mock'

const mockTeamModel = {
  getCriteriaMet: jest.fn(),
  getStage: jest.fn(),
  markCheckinStage: jest.fn(),
  initialLoad: jest.fn(),
  markInspectionCheckbox: jest.fn()
}

const mockOverallModel = {
  getInspectionChecklist: jest.fn(),
  getTeamsByStage: jest.fn()
}

function mockTeamStage (stage: INSPECTION_STAGE): void {
  mockTeamModel.getStage.mockReturnValueOnce(stage)
}

function haveAllStagesReturnEmpty (): void {
  mockOverallModel.getTeamsByStage.mockImplementation(() => [])
}

function haveStageReturnTeams (stage: INSPECTION_STAGE, teams: string[]): void {
  mockOverallModel.getTeamsByStage.mockImplementation((s: INSPECTION_STAGE) => {
    if (s === stage) {
      return teams
    }
    return []
  })
}

function useBaseInitialLoadMock (): void {
  mockTeamModel.initialLoad.mockResolvedValueOnce(INSPECTION_STAGE.NO_SHOW).mockResolvedValueOnce(INSPECTION_STAGE.NOT_HERE)
}

function haveInspectionUpdateReturn (stage: INSPECTION_STAGE): void {
  mockTeamModel.markInspectionCheckbox.mockResolvedValueOnce(stage)
}

function haveCheckinUpdateReturn (stage: INSPECTION_STAGE): void {
  mockTeamModel.markCheckinStage.mockResolvedValueOnce(stage)
}

function haveCriteriaMetReturn (criteria: number[]): void {
  mockTeamModel.getCriteriaMet.mockResolvedValueOnce(criteria)
}

function useMockInspectionChecklist (checklist: InspectionChecklist): void {
  mockOverallModel.getInspectionChecklist.mockResolvedValueOnce(checklist)
}

describe('InspectionService', () => {
  let service: InspectionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionService, {
          provide: PublishService,
          useValue: mockPublishService
        },
        InspectionService, {
          provide: TeamModel,
          useValue: mockTeamModel
        },
        InspectionService, {
          provide: OverallModel,
          useValue: mockOverallModel
        }
      ]
    }).compile()

    service = module.get<InspectionService>(InspectionService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('on receiving a team list', () => {
    it('should broadcast the inspection status of each team', async () => {
      haveAllStagesReturnEmpty()
      useBaseInitialLoadMock()

      await service.loadTeams(['1', '2'])

      expectTeamBroadcast('1', INSPECTION_STAGE.NO_SHOW)
      expectTeamBroadcast('2', INSPECTION_STAGE.NOT_HERE)
    })

    it('should broadcast the inspection status of each stage', async () => {
      haveStageReturnTeams(INSPECTION_STAGE.NO_SHOW, ['1', '2'])
      useBaseInitialLoadMock()

      await service.loadTeams(['1', '2'])

      expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${INSPECTION_STAGE.NO_SHOW as string}`, { teams: ['1', '2'] })
      expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${INSPECTION_STAGE.NOT_HERE as string}`, { teams: [] })
    })

    it('should broadcast the individual inspection status of each team', async () => {
      haveAllStagesReturnEmpty()
      useBaseInitialLoadMock()

      await service.loadTeams(['1', '2'])

      expectTeamBroadcast('1', INSPECTION_STAGE.NO_SHOW)
      expectTeamBroadcast('2', INSPECTION_STAGE.NOT_HERE)
    })
  })

  describe('on receiving a checkin stage', () => {
    it('should update the inspection status of the team', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)

      await service.markCheckinStage('1', INSPECTION_STAGE.NO_SHOW)

      expect(mockTeamModel.markCheckinStage).toHaveBeenCalledWith('1', INSPECTION_STAGE.NO_SHOW)
    })

    it('should throw an error if the event is not in the checkin stage', async () => {
      service.setEventStage(EVENT_STAGE.EVENT)

      await expect(service.markCheckinStage('1', INSPECTION_STAGE.NO_SHOW)).rejects.toThrowError('Check in closed')
    })
  })

  describe('on receiving an inspection status', () => {
    it('should update the inspection status of the team', async () => {
      await service.markMetOrNot('1', 1, true)

      expect(mockTeamModel.markInspectionCheckbox).toHaveBeenCalledWith('1', 1, true)
    })

    it('should handle a change in inspection status', async () => {
      mockTeamStage(INSPECTION_STAGE.COMPLETE)
      haveInspectionUpdateReturn(INSPECTION_STAGE.PARTIAL)

      await service.markMetOrNot('1', 1, false)

      expectTeamBroadcast('1', INSPECTION_STAGE.PARTIAL)
    })

    it('should throw an error if the team is not checked in', async () => {
      mockTeamStage(INSPECTION_STAGE.NOT_HERE)

      await expect(service.markMetOrNot('1', 1, true)).rejects.toThrowError('Team not checked in')
    })
  })

  describe('on receiving a change in inspection status', () => {
    it('should broadcast the updated list of teams in its old stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      haveStageReturnTeams(INSPECTION_STAGE.NOT_HERE, ['2'])
      mockTeamStage(INSPECTION_STAGE.NOT_HERE)

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expectGroupBroadcast(['2'], INSPECTION_STAGE.NOT_HERE)
    })

    it('should broadcast the updated list of teams in its new stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      haveStageReturnTeams(INSPECTION_STAGE.CHECKED_IN, ['1', '2'])
      mockTeamStage(INSPECTION_STAGE.NOT_HERE)
      haveCheckinUpdateReturn(INSPECTION_STAGE.CHECKED_IN)

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expectGroupBroadcast(['1', '2'], INSPECTION_STAGE.CHECKED_IN)
    })

    it('should do nothing if the new stage is the same as the old stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockTeamStage(INSPECTION_STAGE.CHECKED_IN)
      haveCheckinUpdateReturn(INSPECTION_STAGE.CHECKED_IN)

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockPublishService.broadcast).not.toHaveBeenCalled()
    })

    it('should broadcast that checkin can conclude if the last team leaves the NOT_HERE stage', async () => {
      mockTeamStage(INSPECTION_STAGE.NOT_HERE)
      haveInspectionUpdateReturn(INSPECTION_STAGE.CHECKED_IN)
      service.setEventStage(EVENT_STAGE.CHECKIN)
      haveAllStagesReturnEmpty()

      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/canConclude', true)
    })

    it('should broadcast that checkin cannot conclude if a team reenters the NOT_HERE stage', async () => {
      service.setEventStage(EVENT_STAGE.CHECKIN)
      mockTeamStage(INSPECTION_STAGE.NOT_HERE)
      haveCheckinUpdateReturn(INSPECTION_STAGE.CHECKED_IN)
      haveAllStagesReturnEmpty()
      await service.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      mockTeamStage(INSPECTION_STAGE.CHECKED_IN)
      haveCheckinUpdateReturn(INSPECTION_STAGE.NOT_HERE)
      haveStageReturnTeams(INSPECTION_STAGE.NOT_HERE, ['1'])

      await service.markCheckinStage('1', INSPECTION_STAGE.NOT_HERE)

      expect(mockPublishService.broadcast).toHaveBeenCalledWith('inspection/canConclude', false)
    })
  })

  describe('get team progress', () => {
    it('should return the inspection progress of a team', async () => {
      const mockInspectionMet = partialMet
      const expectedSummary = makeExpectedSummary(mockInspectionChecklist, mockInspectionMet)

      mockTeamStage(INSPECTION_STAGE.PARTIAL)
      useMockInspectionChecklist(mockInspectionChecklist)
      haveCriteriaMetReturn(mockInspectionMet)
      useMockInspectionChecklist(mockInspectionChecklist)

      const result = await service.getTeamProgress('1')

      expect(result).toEqual(expectedSummary)
    })

    it('should throw an error if the team is not checked in', async () => {
      mockTeamStage(INSPECTION_STAGE.NOT_HERE)

      await expect(service.getTeamProgress('1')).rejects.toThrowError('Team not checked in')
    })
  })
})
