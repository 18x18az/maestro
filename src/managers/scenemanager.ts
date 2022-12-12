import { privateEncrypt } from "crypto";
import ObsWebSocket from "obs-websocket-js";
import { record, IMetadata, LogType } from "../utils/log";

/**
 * Connects to an obs-websocket and controls scene switching
 */
export class SceneManager {

    wsAddr: string = "owowo"
    obs: ObsWebSocket = new ObsWebSocket();

    constructor(){
        this.connect();
    }

    async connect(){
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await this.obs.connect('ws://localhost:4444', 'password');
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
        } catch (error: any) {
            console.error('Failed to connect', error.code, error.message);
        }
    }
}