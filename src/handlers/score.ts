import { IMessage, MESSAGE_TYPE, SimpleMatchResult } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

let latestScore: SimpleMatchResult | null = null;

export function postScoreHandler(metadata: IMetadata, message: IMessage) {
    latestScore = message.payload as SimpleMatchResult;
    broadcast(metadata, message);
}

export function getScoreHandler(metadata: IMetadata): IMessage | null {
    record(metadata, LogType.DATA, "latest score requested");
    if (latestScore) {
        return {
            type: MESSAGE_TYPE.POST,
            path: ['score'],
            payload: latestScore
        }
    } else {
        return null
    }
}