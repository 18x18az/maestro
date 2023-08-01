import { Test } from '@nestjs/testing'
import { InspectionModule } from './inspection.module'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { PublishService } from '../../../utils/publish/publish.service'
import { INestApplication } from '@nestjs/common'
import { MockTransport } from '../../../utils/transport/__test__/mockMqttServer'
import { mockPublishService } from '../../../utils/publish/__test__/publish.service.mock'
import { expectGroupBroadcast, expectTeamBroadcast } from './__test__/expects'
import { EVENT_STAGE, INSPECTION_STAGE } from '@18x18az/rosetta'
import * as request from 'supertest'
import { InspectionChecklist } from './inspection.dto'
import { makeExpectedSummary, mockInspectionChecklist } from './__test__/consts'

let transport: MockTransport
const mockPrismaService = {
  checkIn: {
    findUnique: jest.fn(),
    upsert: jest.fn()
  },
  inspectionCriteria: {
    count: jest.fn()
  },
  checkedInspection: {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  },
  inspectionGroup: {
    findMany: jest.fn()
  },
  team: {
    findUnique: jest.fn()
  }
}

async function useMockTeamPoints (team: string, points: number[]): Promise<void> {
  const mockCheckedPoints = jest.fn()
  mockCheckedPoints.mockReturnValue(points.map(p => ({ criteriaId: p })))
  mockPrismaService.team.findUnique.mockReturnValue({ checkedPoints: mockCheckedPoints })
}

async function sendTeams (teams: string[]): Promise<void> {
  await transport.mockEvent('teamList', teams)
}

async function setEventStage (stage: EVENT_STAGE): Promise<void> {
  await transport.mockEvent('eventStage', stage)
}

function haveCheckinDbReturn (stage: INSPECTION_STAGE | null): void {
  if (stage === null) {
    mockPrismaService.checkIn.findUnique.mockResolvedValue(null)
  } else {
    mockPrismaService.checkIn.findUnique.mockResolvedValue({ status: stage })
  }
}

function haveInspectionCountReturn (count: number): void {
  mockPrismaService.checkedInspection.count.mockResolvedValue(count)
}

function mockInspectionCriteria (criteria: InspectionChecklist): void {
  const mockReturn = Object.keys(criteria).map(group => ({ name: group, criteria: criteria[group].map((c, i) => ({ id: c.uuid, text: c.text })) }))
  mockPrismaService.inspectionGroup.findMany.mockResolvedValue(mockReturn)
}

describe('InspectionModule', () => {
  let app: INestApplication

  beforeEach(async () => {
    mockPrismaService.inspectionCriteria.count.mockResolvedValue(2)
    transport = new MockTransport()
    const moduleFixture = Test.createTestingModule({
      imports: [InspectionModule]
    })

    moduleFixture.overrideProvider(PrismaService).useValue(mockPrismaService)
    moduleFixture.overrideProvider(PublishService).useValue(mockPublishService)

    app = (await moduleFixture.compile()).createNestApplication()
    app.connectMicroservice(transport.getStrategy())
    await app.startAllMicroservices()
    await app.init()
  })

  afterEach(async () => {
    jest.resetAllMocks()
    await app.close()
  })

  describe('on initially receiving teams', () => {
    it('should create entries when inspection first starts if none exist', async () => {
      haveCheckinDbReturn(null)
      await sendTeams(['1'])

      expect(mockPrismaService.checkIn.upsert).toBeCalledTimes(1)
      expectTeamBroadcast('1', INSPECTION_STAGE.NOT_HERE)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.NOT_HERE)
    })

    it('should use the existing values if they exist', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.NO_SHOW)
      await sendTeams(['1'])

      expect(mockPrismaService.checkIn.upsert).not.toBeCalled()
      expectTeamBroadcast('1', INSPECTION_STAGE.NO_SHOW)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.NO_SHOW)
    })

    it('should use inspection progress if there is any', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.CHECKED_IN)
      haveInspectionCountReturn(1)
      await sendTeams(['1'])

      expectTeamBroadcast('1', INSPECTION_STAGE.PARTIAL)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.PARTIAL)
    })
  })

  describe('on change in checkin', () => {
    it('should publish updated rollups', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.NOT_HERE)
      haveInspectionCountReturn(0)
      await setEventStage(EVENT_STAGE.CHECKIN)
      await sendTeams(['1'])
      jest.clearAllMocks()

      await request(app.getHttpServer()).post('/inspection/1/checkedIn').expect(201)

      expectTeamBroadcast('1', INSPECTION_STAGE.CHECKED_IN)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.CHECKED_IN)
      expectGroupBroadcast([], INSPECTION_STAGE.NOT_HERE)
    })

    it('should throw an error if the event is not in CHECKIN stage', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.NO_SHOW)
      await setEventStage(EVENT_STAGE.EVENT)
      await sendTeams(['1'])

      await request(app.getHttpServer()).post('/inspection/1/checkedIn').expect(400)
    })

    it('should support marking not here', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.CHECKED_IN)
      await setEventStage(EVENT_STAGE.CHECKIN)
      await sendTeams(['1'])
      jest.clearAllMocks()

      await request(app.getHttpServer()).post('/inspection/1/notHere').expect(201)

      expectTeamBroadcast('1', INSPECTION_STAGE.NOT_HERE)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.NOT_HERE)
    })

    it('should support marking no show', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.CHECKED_IN)
      await setEventStage(EVENT_STAGE.CHECKIN)
      await sendTeams(['1'])
      jest.clearAllMocks()

      await request(app.getHttpServer()).post('/inspection/1/noShow').expect(201)

      expectTeamBroadcast('1', INSPECTION_STAGE.NO_SHOW)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.NO_SHOW)
    })
  })

  describe('marking inspection criteria', () => {
    it('should support marking criteria as met', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.CHECKED_IN)
      await sendTeams(['1'])
      haveInspectionCountReturn(1)
      jest.clearAllMocks()

      await request(app.getHttpServer()).post('/inspection/1/criteria/1?isMet=true').expect(201)

      expect(mockPrismaService.checkedInspection.create).toBeCalledTimes(1)
      expect(mockPrismaService.checkedInspection.create).toBeCalledWith({ data: { criteriaId: 1, teamNumber: '1' } })
      expectTeamBroadcast('1', INSPECTION_STAGE.PARTIAL)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.PARTIAL)
    })

    it('should support marking criteria as not met', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.PARTIAL)
      await sendTeams(['1'])
      haveInspectionCountReturn(0)
      jest.clearAllMocks()

      await request(app.getHttpServer()).post('/inspection/1/criteria/1?isMet=false').expect(201)

      expect(mockPrismaService.checkedInspection.delete).toBeCalledWith({ where: { teamNumber_criteriaId: { teamNumber: '1', criteriaId: 1 } } })
      expectTeamBroadcast('1', INSPECTION_STAGE.CHECKED_IN)
      expectGroupBroadcast(['1'], INSPECTION_STAGE.CHECKED_IN)
    })

    it('should throw an error if the team is not checked in', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.NOT_HERE)
      await sendTeams(['1'])
      jest.clearAllMocks()

      expect(await request(app.getHttpServer()).post('/inspection/1/criteria/1?isMet=true').expect(400))
    })
  })

  describe('getting inspection checklist', () => {
    it('should return the checklist', async () => {
      mockInspectionCriteria(mockInspectionChecklist)

      const response = await request(app.getHttpServer()).get('/inspection/checklist').expect(200)

      expect(response.body).toEqual(mockInspectionChecklist)
    })
  })

  describe('getting team progress', () => {
    it('should return the team progress', async () => {
      const mockPointsMet = [1]
      await useMockTeamPoints('1', mockPointsMet)
      mockInspectionCriteria(mockInspectionChecklist)
      haveCheckinDbReturn(INSPECTION_STAGE.CHECKED_IN)
      await sendTeams(['1'])
      jest.clearAllMocks()

      const response = await (request(app.getHttpServer()).get('/inspection/1').expect(200))

      expect(response.body).toEqual(makeExpectedSummary(mockInspectionChecklist, mockPointsMet))
    })

    it('should throw an error if the team is not checked in', async () => {
      haveCheckinDbReturn(INSPECTION_STAGE.NOT_HERE)
      await sendTeams(['1'])
      jest.clearAllMocks()

      expect(await request(app.getHttpServer()).get('/inspection/1').expect(400))
    })
  })
})
