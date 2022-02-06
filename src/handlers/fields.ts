import { IMessage, MESSAGE_TYPE, FieldId, IFieldInfo } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
let fields: IFieldInfo[];

export function postFieldsHandler(metadata: IMetadata, message: IMessage) {
    fields = message.payload;
    record(metadata, LogType.LOG, 'fields updated')
    record(metadata, LogType.DATA, JSON.stringify(message.payload));
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['fields'],
        payload: fields
    });
};

export function getFieldsHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, 'fields requested');
    return {
        type: MESSAGE_TYPE.POST,
        path: ['fields'],
        payload: fields
    }
}
