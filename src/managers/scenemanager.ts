import { privateEncrypt } from "crypto";
import ObsWebSocket from "obs-websocket-js";
import { record, IMetadata, LogType } from "../utils/log";
import { config } from "dotenv";

config();
/**
 * Connects to an obs-websocket and controls scene switching
 */
export class SceneManager {

    wsAddr: string = "owowo";
    obs: ObsWebSocket = new ObsWebSocket();
    isManual: boolean = false;

    constructor(){
        this.connect();
    }

    async connect(){
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await this.obs.connect(`ws://localhost:${process.env.OBS_WS_PORT as string}`);
            console.log(`Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
        } catch (error: any) {
            console.error('Failed to connect', error.code, error.message);
        }
    }

    async setField(){
        
    }
}