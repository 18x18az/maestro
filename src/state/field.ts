import { IFieldState, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

let fieldState: IFieldState;

export function postFieldHandler(metadata: IMetadata, message: IMessage) {
    fieldState = message.payload;
    record(metadata, LogType.LOG, `${fieldState.match} on ${fieldState.field} - ${fieldState.timeRemaining}`)
    broadcast(metadata, message);
}

export function getFieldHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, "field state requested");
    return{
        type: MESSAGE_TYPE.POST,
        path: ["field"],
        payload: fieldState
    }
}