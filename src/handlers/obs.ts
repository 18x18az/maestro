import { Studio } from "../managers/obs";
import { IMetadata } from "../utils/log";
import { IMessage, MESSAGE_TYPE, IOBSConfig } from "@18x18az/rosetta";

export async function postOBSHandler(metadata: IMetadata, message: IMessage) {
    if ((message.payload as IOBSConfig).setManual) {
        Studio.setManual();
    }
    else {
        Studio.setAuto();
    }

    if ((message.payload as IOBSConfig).attemptReconnect) {
        await Studio.disconnect();
        await Studio.connect();
    }
}

export function getOBSHandler(metadata: IMetadata): IMessage {
    return {
        type: MESSAGE_TYPE.POST,
        path: ['obs'],
        payload: {
            setManual: Studio.getIsManual(),
            isConnected: Studio.isConnected(),
            attemptReconnect: false
        }
    }
}