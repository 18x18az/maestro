import { privateEncrypt } from "crypto";
import ObsWebSocket from "obs-websocket-js";
import { record, IMetadata, LogType } from "../utils/log";

// TODO: should this be here or in class?
const callback = (data: any) => {
	console.log(data);
};

/**
 * Connects to an obs-websocket and controls scene switching
 */
export class SceneManager {

    wsAddr: string = "owowo"
    obs: any = null

    constructor(address: string, meta: IMetadata){
        this.wsAddr = address;
        this.obs = new ObsWebSocket();
        this.connect(meta);
    }

    connect(meta: IMetadata){
        let p = this.obs.connect({address: this.wsAddr}).then(() => {
            console.log(`Success! We're connected & authenticated.`);
        
            return this.obs.send('GetSceneList');
        }).then((data: any) => {
            console.log(`${data.scenes.length} Available Scenes!`);
        
            data.scenes.forEach((scene: any) => {
                if (scene.name !== data["current-scene"]) {
                    console.log(`Found a different scene! Switching to Scene: ${scene.name}`);
        
                    this.obs.send('SetCurrentScene', {
                        'scene-name': scene.name
                    });
                }
            });
        });
        this.obs.on('ConnectionOpened', (data: any) => callback(data));
        this.obs.on('ConnectionClosed', (data: any) => callback(data));
        this.obs.on('error', (err: any) => {
            console.error('socket error:', err);
        });
    }
}