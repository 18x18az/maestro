import { IMessage, MESSAGE_TYPE, TeamId, ITeams } from '@18x18az/rosetta'
import { IMetadata, LogType, record } from '../utils/log'
import { broadcast } from '../utils/wss'
let teams: ITeams

export function postTeamsHandler (metadata: IMetadata, message: IMessage) {
  teams = message.payload
  record(metadata, LogType.LOG, 'teams updated')
  record(metadata, LogType.DATA, JSON.stringify(message.payload))
  broadcast(metadata, {
    type: MESSAGE_TYPE.POST,
    path: ['teams'],
    payload: teams
  })
};

export function getTeamsHandler (metadata: IMetadata): IMessage {
  record(metadata, LogType.LOG, 'teams requested')
  return {
    type: MESSAGE_TYPE.POST,
    path: ['teams'],
    payload: teams
  }
}

export function getNumber (team: TeamId | null) {
  if (team) {
    return teams[team].number
  }
}
