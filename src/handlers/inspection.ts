import { IMessage, MESSAGE_TYPE, TeamId } from "@18x18az/rosetta"
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

interface IInspectionStatus {
    uninspected: Array<TeamId>
    inspected: Array<TeamId>
}

let inspection: IInspectionStatus;

export function postInspectionHandler(metadata: IMetadata, message: IMessage) {
    inspection = message.payload;
    record(metadata, LogType.LOG, 'inspection updated');
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ['inspection'],
        payload: inspection
    });
}

export function getInspectionHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, 'inspection requested');
    return {
        type: MESSAGE_TYPE.POST,
        path: ['inspection'],
        payload: inspection
    }
}