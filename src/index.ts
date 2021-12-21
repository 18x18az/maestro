import { TeamId } from "@18x18az/rosetta";
import { record, getNextId, LogType, IMetadata } from "./utils/log"
import { AllianceSelection } from "./state/alliance"
import ObsWebSocket from "obs-websocket-js";

const id = getNextId();
const meta: IMetadata = {
    id
}

function doTheThing(metadata: IMetadata){
    record(metadata, LogType.LOG, "hello world");
}


doTheThing(meta);

// create websocket
const obs = new ObsWebSocket();
obs.connect({address: 'localhost:4444'}).then(() => {
    console.log(`Success! We're connected & authenticated.`);

    return obs.send('GetSceneList');
}).then(data => {
    console.log(`${data.scenes.length} Available Scenes!`);

    data.scenes.forEach(scene => {
        if (scene.name !== data["current-scene"]) {
            console.log(`Found a different scene! Switching to Scene: ${scene.name}`);

            obs.send('SetCurrentScene', {
                'scene-name': scene.name
            });
        }
    });
});


const callback = (data: any) => {
	console.log(data);
};

// The following are additional supported events.
obs.on('ConnectionOpened', (data) => callback(data));
obs.on('ConnectionClosed', (data) => callback(data));
obs.on('AuthenticationSuccess', (data) => callback(data));
obs.on('AuthenticationFailure', (data) => callback(data));



/* // alliance selection test
let stdin = process.openStdin();

let teams: Array<string> = [];
for(let i = 1; i <= 38; i++){
    teams.push(i.toString());
}
let als: AllianceSelection = new AllianceSelection(teams, meta);


stdin.addListener("data", function(d) {
console.log("you entered: [" + d.toString().trim() + "]");
    switch(d.toString().trim()[0]){
        case "p":
            als.pick(d.toString().trim().substring(1), meta);
            break;
        case "a":
            als.accept(meta);
            break;
        case "d":
            als.decline(meta);
            break;
        case "u":
            als.undo(meta);
            break;
    }
});
*/