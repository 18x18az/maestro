import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

export enum FIELD_CONTROL_STATE {
    IN_MATCH = "START",
    BETWEEN_MATCHES = "RESUME"
}

export interface IFieldControlState {
    state: FIELD_CONTROL_STATE
}

export function postFieldControlHandler(metadata: IMetadata, message: IMessage) {
    record(metadata, LogType.LOG, 'field control owo')
    record(metadata, LogType.DATA, JSON.stringify(message.payload));
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['fieldcontrol'],
        payload: message.payload
    });
}

export function getFieldControlHandler(metadata: IMetadata, message: IMessage): IMessage {
    return {
        type: MESSAGE_TYPE.POST,
        path: ['fieldcontrol'],
        payload: { "bruh": "why you getting field control?"}
    }
}