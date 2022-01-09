import { IMessage, MESSAGE_TYPE, IMatchList } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
let matches: IMatchList;

export function postMatchesHandler(metadata: IMetadata, message: IMessage){
    matches = message.payload;
    record(metadata, LogType.LOG, 'match list updated')
    record(metadata, LogType.DATA, JSON.stringify(message.payload));
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['matches'],
        payload: matches
    });
};

export function getMatchesHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, 'matches requested');
    return{
        type: MESSAGE_TYPE.POST,
        path: ['matches'],
        payload: matches
    }
}