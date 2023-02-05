import { callPreset } from "../utils/camera";
import { Studio } from "./obs";

export namespace Director {
    let currentField: number = 1;

    export async function setAudience(){
        let nextAudienceScene = currentField - 1;
        if(nextAudienceScene === 0){
            nextAudienceScene = 3;
        }

        Studio.setAudience(nextAudienceScene);
        callPreset(nextAudienceScene, 1);
    }

    export async function setField(fieldString: string){
        let field = parseInt(fieldString);

        if(field === 0){
            return
        }

        currentField = field;
        Studio.setField(field);
        callPreset(field, 0);
    }
}