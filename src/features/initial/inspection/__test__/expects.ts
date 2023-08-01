import { INSPECTION_STAGE } from '@18x18az/rosetta'
import { mockPublishService } from '../../../../utils/publish/__test__/publish.service.mock'

export function expectTeamBroadcast (team: string, stage: INSPECTION_STAGE): void {
  expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/team/${team}`, stage)
}

export function expectGroupBroadcast (teams: string[], stage: INSPECTION_STAGE): void {
  expect(mockPublishService.broadcast).toHaveBeenCalledWith(`inspection/stage/${stage as string}`, { teams })
}
