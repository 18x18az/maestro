import ObsWebSocket, { RequestBatchExecutionType, RequestBatchOptions } from "obs-websocket-js";
import { record, IMetadata, LogType } from "../utils/log";
import { config } from "dotenv";
import { FieldId } from "@18x18az/rosetta";

config();
/**
 * Connects to an obs-websocket and controls scene switching
 */
export namespace OBS {

    let obs: ObsWebSocket = new ObsWebSocket();
    let isManual: boolean = false;
    let currentField: FieldId = "1";

    export async function connect(): Promise<boolean> {
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await obs.connect(`ws://localhost:${process.env.OBS_WS_PORT as string}`);
            console.log(`Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            return true;
        } catch (error: any) {
            console.error('Failed to connect', error.code, error.message);
            return false;
        }
    }

    export function lock() {
        isManual = true;
    }

    export function unlock() {
        isManual = false;
    }

    export async function setField(field: FieldId): Promise<boolean> {
        if (isManual || field === currentField) {
            return false;
        }

        return true;
    }

    export async function nextField(): Promise<boolean> {
        if (isManual) {
            return false;
        }
        
        return true;
    }

    export async function setAudience(): Promise<boolean> {
        if (isManual) {
            return false;
        }

        await obs.call('SetCurrentPreviewScene', { sceneName: 'Webcam Overlay' });

        return true;
    }

    export async function triggerTransition(): Promise<boolean> {
        if (isManual) {
            return false;
        }

        await obs.call('TriggerStudioModeTransition');
        return true;
    }
}