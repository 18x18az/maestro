import ObsWebSocket from "obs-websocket-js";
import { record, IMetadata, LogType } from "../utils/log";
import { config } from "dotenv";
import { FieldId, IMessage } from "@18x18az/rosetta";

config();
/**
 * Connects to an obs-websocket and controls scene switching
 */
export namespace OBS {

    let obs: ObsWebSocket = new ObsWebSocket();
    let isManual: boolean = false;
    let connected: boolean = false;

    export async function connect(): Promise<boolean> {
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await obs.connect(`ws://localhost:${process.env.OBS_WS_PORT as string}`);
            console.log(`Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            connected = true;
            return true;
        } catch (error: any) {
            console.error('Failed to connect to OBS server', error.code, error.message);
            connected = false;
            return false;
        }
    }

    export async function disconnect(): Promise<boolean> {
        if (!connected) {
            return false;
        }
        await obs.disconnect();
        return true;
    }

    export function lock() {
        isManual = true;
    }

    export function unlock() {
        isManual = false;
    }

    export async function setField(field: FieldId): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }
        if (field == "1") {
            console.log(process.env.OBS_SCENE_FIELDA);
        }
        else if (field == "2") {
            console.log(process.env.OBS_SCENE_FIELDB);
        }
        else if (field == "3") {
            console.log(process.env.OBS_SCENE_FIELDC);
        }
        else {
            console.log(`field ID ${field} not supported`);
            return false;
        }

        return true;
    }

    export async function setAudience(): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }

        await obs.call('SetCurrentPreviewScene', { sceneName: process.env.OBS_SCENE_AUDIENCE_OVERLAY as string });

        return true;
    }

    export async function triggerTransition(): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }

        await obs.call('TriggerStudioModeTransition');
        return true;
    }
}

export function postSceneHandler(metadata: IMetadata, message: IMessage) {

}