import { IMessage } from "@18x18az/rosetta";
import { announce } from "../utils/announcement";
import { IMetadata } from "../utils/log";

export function postAnnounceHandler(metadata: IMetadata, message: IMessage){
    console.log(message);
    announce(metadata, message.payload);
}

