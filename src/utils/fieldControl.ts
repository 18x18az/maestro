import { FIELD_COMMAND, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata } from "./log";
import { broadcast } from "./wss";

export async function startMatch(meta: IMetadata){
    await broadcast(meta, {path: ["fieldCommand"], type: MESSAGE_TYPE.POST, payload: FIELD_COMMAND.START_MATCH});
}

export async function queueMatch(meta: IMetadata){
    await broadcast(meta, {path: ["fieldCommand"], type: MESSAGE_TYPE.POST, payload: FIELD_COMMAND.QUEUE_NEXT});
}