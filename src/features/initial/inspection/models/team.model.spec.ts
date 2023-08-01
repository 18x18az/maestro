import { Test, TestingModule } from '@nestjs/testing'
import { TeamModel } from './team.model'
import { InspectionDatabase } from '../repo.service'
import { INSPECTION_STAGE } from '@18x18az/rosetta'

const mockInspectionDatabase = {
  setCheckinStage: jest.fn(),
  getCheckinStage: jest.fn(),
  upsertStatus: jest.fn(),
  getNumberOfCriteriaMet: jest.fn(),
  getTotalNumberOfCriteria: jest.fn(),
  markCriteriaMet: jest.fn(),
  markCriteriaNotMet: jest.fn()
}

function setInspectionResult (met: number): void {
  mockInspectionDatabase.getNumberOfCriteriaMet.mockResolvedValueOnce(met)
}

describe('TeamModel', () => {
  let model: TeamModel

  beforeEach(async () => {
    mockInspectionDatabase.getTotalNumberOfCriteria.mockResolvedValue(2)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamModel, {
          provide: InspectionDatabase,
          useValue: mockInspectionDatabase
        }
      ]
    }).compile()

    model = module.get<TeamModel>(TeamModel)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(model).toBeDefined()
  })

  describe('markCheckinStage', () => {
    it('should update the stage in the database', async () => {
      await model.markCheckinStage('1', INSPECTION_STAGE.NOT_HERE)

      expect(mockInspectionDatabase.setCheckinStage).toHaveBeenCalledWith('1', INSPECTION_STAGE.NOT_HERE)
    })

    it('should update the status in the database', async () => {
      await model.markCheckinStage('1', INSPECTION_STAGE.NOT_HERE)

      expect(mockInspectionDatabase.upsertStatus).toHaveBeenCalledWith('1', INSPECTION_STAGE.NOT_HERE)
    })

    it('should return the status', async () => {
      const status = await model.markCheckinStage('1', INSPECTION_STAGE.NOT_HERE)

      expect(status).toEqual(INSPECTION_STAGE.NOT_HERE)
    })

    it('should evaluate the inspection progress if the status is CHECKED_IN', async () => {
      await model.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockInspectionDatabase.getNumberOfCriteriaMet).toHaveBeenCalledWith('1')
    })

    it('should return the inspection progress if the status is CHECKED_IN', async () => {
      setInspectionResult(1)

      const result = await model.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })

    it('should save the inspection progress if the status is CHECKED_IN', async () => {
      setInspectionResult(1)

      await model.markCheckinStage('1', INSPECTION_STAGE.CHECKED_IN)

      expect(mockInspectionDatabase.upsertStatus).toHaveBeenCalledWith('1', INSPECTION_STAGE.PARTIAL)
    })
  })

  describe('markInspectionCheckbox', () => {
    it('should mark the criteria as met if met is true', async () => {
      await model.markInspectionCheckbox('1', 1, true)

      expect(mockInspectionDatabase.markCriteriaMet).toHaveBeenCalledWith('1', 1)
      expect(mockInspectionDatabase.markCriteriaNotMet).not.toHaveBeenCalled()
    })

    it('should mark the criteria as not met if met is false', async () => {
      await model.markInspectionCheckbox('1', 1, false)

      expect(mockInspectionDatabase.markCriteriaNotMet).toHaveBeenCalledWith('1', 1)
      expect(mockInspectionDatabase.markCriteriaMet).not.toHaveBeenCalled()
    })

    it('should return the updated status', async () => {
      setInspectionResult(1)

      const result = await model.markInspectionCheckbox('1', 1, true)

      expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })

    it('should save the updated status', async () => {
      setInspectionResult(1)

      await model.markInspectionCheckbox('1', 1, true)

      expect(mockInspectionDatabase.upsertStatus).toHaveBeenCalledWith('1', INSPECTION_STAGE.PARTIAL)
    })

    it('should return CHECKED_IN if no criteria are met', async () => {
      setInspectionResult(0)

      const result = await model.markInspectionCheckbox('1', 1, false)

      expect(result).toEqual(INSPECTION_STAGE.CHECKED_IN)
    })

    it('should return PARTIAL if some criteria are met', async () => {
      setInspectionResult(1)

      const result = await model.markInspectionCheckbox('1', 1, false)

      expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })

    it('should return COMPLETE if all criteria are met', async () => {
      setInspectionResult(2)

      const result = await model.markInspectionCheckbox('1', 1, true)

      expect(result).toEqual(INSPECTION_STAGE.COMPLETE)
    })
  })

  describe('on initial load', () => {
    it('should return the progress if checkin stage exists', async () => {
      mockInspectionDatabase.getCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.NO_SHOW)

      const result = await model.initialLoad('1')

      expect(result).toEqual(INSPECTION_STAGE.NO_SHOW)
    })

    it('should return NOT_HERE if the checkin stage does not exist', async () => {
      mockInspectionDatabase.getCheckinStage.mockResolvedValueOnce(undefined)

      const result = await model.initialLoad('1')

      expect(result).toEqual(INSPECTION_STAGE.NOT_HERE)
    })

    it('should create the rollup entry', async () => {
      mockInspectionDatabase.getCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.NOT_HERE)

      await model.initialLoad('1')

      expect(mockInspectionDatabase.upsertStatus).toHaveBeenCalledWith('1', INSPECTION_STAGE.NOT_HERE)
    })

    it('should save the checkin stage if it does not exist', async () => {
      mockInspectionDatabase.getCheckinStage.mockResolvedValueOnce(undefined)

      await model.initialLoad('1')

      expect(mockInspectionDatabase.setCheckinStage).toHaveBeenCalledWith('1', INSPECTION_STAGE.NOT_HERE)
    })

    it('should evaluate inspection progress if the checkin stage is CHECKED_IN', async () => {
      mockInspectionDatabase.getCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.CHECKED_IN)
      setInspectionResult(1)

      const result = await model.initialLoad('1')

      expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })

    it('should use the inspection progress for the rollup entry', async () => {
      mockInspectionDatabase.getCheckinStage.mockResolvedValueOnce(INSPECTION_STAGE.CHECKED_IN)
      setInspectionResult(1)

      await model.initialLoad('1')

      expect(mockInspectionDatabase.upsertStatus).toHaveBeenCalledWith('1', INSPECTION_STAGE.PARTIAL)
    })
  })
})
