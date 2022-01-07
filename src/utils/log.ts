import { IConnectionId } from "./wss";
let id = 0;

type ILogId = number;


export enum LogType {
    ERROR = "ERROR",
    LOG = "LOG"
}


export interface IMetadata{
    id: ILogId
    connection: IConnectionId | null
}

export function getNextId(): ILogId{
    return id++;
}

export function record(metadata: IMetadata, type: LogType, message: string){
    const payload = {message, ...metadata, type};
    console.log(`${type}: ${message} - ${JSON.stringify(metadata)}`);
}