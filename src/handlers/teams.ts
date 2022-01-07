import { IMessage, MESSAGE_TYPE, Teams } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
let teams: Teams;

export function postTeamsHandler(metadata: IMetadata, message: IMessage){
    teams = message.payload;
    record(metadata, LogType.LOG, 'teams updated')
    record(metadata, LogType.DATA, JSON.stringify(message.payload));
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['teams'],
        payload: teams
    });
};