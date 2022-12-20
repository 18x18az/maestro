import ObsWebSocket from "obs-websocket-js";
import { config } from "dotenv";
import { FieldId } from "@18x18az/rosetta";

config();
/**
 * Connects to an obs-websocket and controls scene switching
 */
export namespace Studio {

    let obs: ObsWebSocket = new ObsWebSocket();
    let isManual: boolean = false;
    let connected: boolean = false;

    export async function connect(): Promise<boolean> {
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await obs.connect(`ws://localhost:${process.env.OBS_WS_PORT as string}`);
            console.log(`OBS: Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            connected = true;
            return true;
        } catch (error: any) {
            console.error('OBS: Failed to connect to OBS server', error.code, error.message);
            connected = false;
            return false;
        }
    }

    export async function disconnect(): Promise<boolean> {
        if (!connected) {
            return false;
        }
        await obs.disconnect();
        console.log("OBS: Disconnect from OBS server");
        return true;
    }

    export function setManual() {
        console.log("OBS: set to manual mode")
        isManual = true;
    }

    export function setAuto() {
        console.log("OBS: set to automatic mode")
        isManual = false;
    }

    // returns true if in manual, false otherwise
    export function getIsManual() {
        return isManual;
    }

    export function isConnected() {
        return connected;
    }

    export async function setField(field: FieldId): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }
        if (field == "1") {
            await obs.call('SetCurrentPreviewScene',
                { sceneName: process.env.OBS_SCENE_FIELDA as string
            });
            console.log("OBS: set scene preview " + process.env.OBS_SCENE_FIELDA);
        }
        else if (field == "2") {
            await obs.call('SetCurrentPreviewScene',
                { sceneName: process.env.OBS_SCENE_FIELDB as string
            });
            console.log("OBS: set scene preview " + process.env.OBS_SCENE_FIELDB);
        }
        else if (field == "3") {
            await obs.call('SetCurrentPreviewScene',
                { sceneName: process.env.OBS_SCENE_FIELDC as string
            });
            console.log("OBS: set scene preview " + process.env.OBS_SCENE_FIELDC);
        }
        else {
            console.log(`OBS: field ID ${field} not supported`);
            return false;
        }

        return true;
    }

    export async function setAudience(): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }
        console.log(`OBS: set scene ${process.env.OBS_SCENE_AUDIENCE_OVERLAY}`);
        await obs.call('SetCurrentPreviewScene', { sceneName: process.env.OBS_SCENE_AUDIENCE_OVERLAY as string });

        return true;
    }

    export async function triggerTransition(): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }

        console.log("OBS: triggering transition");
        await obs.call('TriggerStudioModeTransition');
        return true;
    }
} // end namespace OBS

