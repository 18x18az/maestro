import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

interface ScheduleBlock {
    start: Date,
    stop: Date,
    matches: number[]
}

let schedule: ScheduleBlock[];

export function postScheduleHandler(metadata: IMetadata, message: IMessage){
    schedule = message.payload;
    record(metadata, LogType.LOG, 'schedule updated')
    record(metadata, LogType.DATA, JSON.stringify(message.payload));
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['schedule'],
        payload: schedule
    });
};

export function getScheduleHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, 'schedule requested');
    return{
        type: MESSAGE_TYPE.POST,
        path: ['schedule'],
        payload: schedule
    }
}