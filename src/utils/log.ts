import { IConnectionId } from "./wss";
let id = 0;

type ILogId = number;


export enum LogType {
    ERROR = "ERROR",
    LOG = "LOG",
    DATA = "DATA"
}


export interface IMetadata {
    id: ILogId
    connection: IConnectionId | null
}

export function getNextId(): ILogId {
    return id++;
}

export function record(metadata: IMetadata, type: LogType, message: string) {
    const d = new Date();
    const iso = d.toISOString();
    if (type != LogType.DATA) {
        console.log(`${type}: ${message} - ${JSON.stringify(metadata)} - ${iso}`);
    }
}