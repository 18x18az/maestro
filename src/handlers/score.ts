import { IMessage, SimpleMatchResult } from "@18x18az/rosetta";
import { IMetadata } from "../utils/log";
import { broadcast } from "../utils/wss";

export function ScoreHandler(metadata: IMetadata, message: IMessage){
    const score = JSON.parse(message.payload) as SimpleMatchResult;
    broadcast(metadata, message.payload);
}