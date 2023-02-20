import ObsWebSocket from "obs-websocket-js";
import { config } from "dotenv";
import { callPreset } from "../utils/camera";

interface StandardScene {
    timerId: number | undefined
    audienceId: number | undefined
}

export enum OVERLAY {
    AUDIENCE = "AUDIENCE",
    TIMER = "TIMER",
    NONE = "NONE"
}

export enum TRANSITION_TYPE {
    STINGER,
    CUT
}

config();
/**
 * Connects to an obs-websocket and controls scene switching
 */
export namespace Studio {

    let obs: ObsWebSocket = new ObsWebSocket();
    let isManual: boolean = false;
    let connected: boolean = false;

    let scenes: Array<StandardScene>;

    export async function connect(): Promise<boolean> {
        try {
            const {
                obsWebSocketVersion,
                negotiatedRpcVersion
            } = await obs.connect(`ws://localhost:${process.env.OBS_WS_PORT as string}`);
            console.log(`OBS: Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            connected = true;
            console.log(await obs.call("GetTransitionKindList"));
            populateScenes();
            return true;
        } catch (error: any) {
            console.error('OBS: Failed to connect to OBS server', error.code, error.message);
            connected = false;
            return false;
        }
    }

    async function getSceneItemId(sceneName: string, sourceName: string): Promise<number | undefined> {
        try {
            const result = await obs.call("GetSceneItemId", { sceneName, sourceName });
            return result.sceneItemId;
        } catch (error) {
            return undefined;
        }

    }

    async function getSceneInfo(sceneName: string): Promise<StandardScene> {
        let timerId = await getSceneItemId(sceneName, "Timer");
        let audienceId = await getSceneItemId(sceneName, "Audience")
        const sceneInfo = { timerId, audienceId };
        return sceneInfo;
    }

    async function populateScenes(): Promise<void> {
        scenes = await Promise.all(Array.from(Array(8)).map(async (x, i) => {
            const scene = await getSceneInfo(`${i + 1}`);
            return scene;
        }));
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

    export async function setField(field: number): Promise<boolean> {
        return setPreviewScene(field, OVERLAY.TIMER);
    }

    export async function setAudience(sceneNumber: number): Promise<boolean> {
        return await setPreviewScene(sceneNumber, OVERLAY.AUDIENCE)
    }

    async function setSceneItemEnabled(sceneName: string, sceneItemId: number | undefined, sceneItemEnabled: boolean) {
        if (sceneItemId === undefined) {
            return
        }

        await obs.call('SetSceneItemEnabled', { sceneName, sceneItemId, sceneItemEnabled });
    }

    export async function setPreviewOverlay(overlay: OVERLAY) {
        const sceneName = (await obs.call('GetCurrentPreviewScene')).currentPreviewSceneName;
        const sceneNumber = parseInt(sceneName);
        const targetIds = scenes[sceneNumber - 1];
        await setSceneItemEnabled(sceneName, targetIds.audienceId, overlay === OVERLAY.AUDIENCE);
        await setSceneItemEnabled(sceneName, targetIds.timerId, overlay === OVERLAY.TIMER);
    }

    export async function setPreviewScene(sceneNumber: number, overlay: OVERLAY): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }
        const sceneName = `${sceneNumber}`
        console.log(`OBS: set scene ${sceneName} with overlay ${overlay}`);
        await obs.call('SetCurrentPreviewScene', { sceneName });
        await setPreviewOverlay(overlay);
        return true;
    }

    export async function triggerTransition(type: TRANSITION_TYPE): Promise<boolean> {
        if (isManual || !connected) {
            return false;
        }

        console.log("OBS: triggering transition");
        let transitionName = 'Cut';
        if (type === TRANSITION_TYPE.STINGER) {
            transitionName = 'Stinger'
        } else if(type === TRANSITION_TYPE.CUT) {
            transitionName = 'Cut'
        }
        await obs.call('SetCurrentSceneTransition', { transitionName })
        await obs.call('TriggerStudioModeTransition');
        return true;
    }
} // end namespace OBS
