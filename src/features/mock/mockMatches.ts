import { QualScheduleUpload } from '../initial/qual-schedule/qual-schedule.interface'

const mockMatches: QualScheduleUpload = {
  blocks: [
    {
      start: '2021-04-24T09:00:00.000Z',
      matches: [
        {
          redAlliance: {
            team1: '127C',
            team2: '5090X'
          },
          blueAlliance: {
            team1: '6030J',
            team2: '8800T'
          },
          number: 1
        },
        {
          redAlliance: {
            team1: '127C',
            team2: '6030J'
          },
          blueAlliance: {
            team1: '5090X',
            team2: '8800T'
          },
          number: 2
        }
      ]
    }
  ]
}

export default mockMatches
