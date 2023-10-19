import { QualUpload } from '../initial/qual/qual-list.interface'

const mockMatches: QualUpload = {
  blocks: [
    {
      start: '2021-04-24T09:00:00.000Z',
      cycleTime: 300,
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
