import { Studio } from "./obs";

export namespace Director {
    let currentField: number = 1;

    export async function setAudience(){
        let nextAudienceScene = currentField - 1;
        if(nextAudienceScene === 0){
            nextAudienceScene = 3;
        }

        await Studio.setAudience(nextAudienceScene)
    }

    export async function setField(fieldString: string){
        let field = parseInt(fieldString);

        if(field === 0){
            return
        }

        currentField = field;
        await Studio.setField(field);
    }
}