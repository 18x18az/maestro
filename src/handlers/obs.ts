import { OBS } from "../managers/obs";
import { IMetadata } from "../utils/log";
import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";

// TODO: move to rosetta
interface IOBSConfig {
    setManual: boolean,
    isConnected: boolean,
    attemptReconnect: boolean
}

export async function postOBSHandler(metadata: IMetadata, message: IMessage) {
    if ((message.payload as IOBSConfig).setManual) {
        OBS.setManual();
    }
    else {
        OBS.setAuto();
    }

    if ((message.payload as IOBSConfig).attemptReconnect) {
        await OBS.disconnect();
        await OBS.connect();
    }
}

export function getOBSHandler(metadata: IMetadata): IMessage {
    return {
        type: MESSAGE_TYPE.POST,
        path: ['obs'],
        payload: {
            setManual: OBS.getIsManual(),
            isConnected: OBS.isConnected(),
            attemptReconnect: false
        }
    }
}