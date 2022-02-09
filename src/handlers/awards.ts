import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

function refreshAwards(metadata: IMetadata) {
    record(metadata, LogType.LOG, "awards refresh requested");
    broadcast(metadata, {
        type: MESSAGE_TYPE.GET,
        path: ["awards"]
    });
}

export function postAwardsHandler(metadata: IMetadata, message: IMessage) {
    if(!message.payload){
        refreshAwards(metadata);
    }
}