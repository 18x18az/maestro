import { IMessage } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

export function postFieldHandler(metadata: IMetadata, message: IMessage) {
    broadcast(metadata, message);
}