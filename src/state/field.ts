import { IFieldState, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

let fieldState: IFieldState;
let start: number = 0;

export function postFieldHandler(metadata: IMetadata, message: IMessage) {
    fieldState = message.payload;
    // fieldState.control = 0 is auto
    // fieldState.timeRemaining = 15 brrr
    // this checks for if a new match starts
    if(fieldState.control == 0 && fieldState.timeRemaining == 15 && fieldState.match != 'P Skills'){
        let delta = Date.now() - start; // in milliseconds
        if(fieldState.match == 'Q1'){ // TODO: if we have a bool for lunch break put it here
            delta = 0;
        }
        console.log(delta);
        start = Date.now();
    }
    record(metadata, LogType.LOG, `${fieldState.match} on ${fieldState.field} - ${fieldState.timeRemaining}`)
    broadcast(metadata, message);
}

export function getFieldHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, "field state requested");
    return{
        type: MESSAGE_TYPE.POST,
        path: ["field"],
        payload: fieldState
    }
}