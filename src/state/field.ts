import { IFieldState, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

let fieldState: IFieldState;
let lastStartTime: number = 0;
let delta: number;
let cycleTimes : number[] = [];
let rollingAvgCycleTime: number = 0;

export function postFieldHandler(metadata: IMetadata, message: IMessage) {
    fieldState = message.payload;
    // this checks for if a new match starts
    if(fieldState.control == 0 && fieldState.timeRemaining == 15 && fieldState.match != 'P Skills'){
        delta = (Date.now() - lastStartTime)/60000;
        if(fieldState.match == 'Q1' || delta > 30){
            delta = 0;
        }
        else{ // if delta is nonzero then include it in rolling avg calculation
            cycleTimes.push(delta);
            rollingAvgCycleTime = 0;
            if(cycleTimes.length > 5) cycleTimes.shift(); 
            for(let i = 0; i < cycleTimes.length; i++){
                rollingAvgCycleTime += cycleTimes[i];
            }
            rollingAvgCycleTime /= cycleTimes.length;
        }
        console.log(delta + " minutes since last match");
        console.log("rolling average: " + rollingAvgCycleTime);
        // TODO: write to .csv file
        lastStartTime = Date.now();
        let cycleTimeMsg: IMessage = {
            type: MESSAGE_TYPE.POST,
            path: ["cycleTime"],
            payload: {
                match: fieldState.match,
                startTime: new Date().toUTCString(),
                currentCycleTime: delta,
                rollingAvg: rollingAvgCycleTime,
                recentCycleTimes: cycleTimes
            }
        };
        record(metadata, LogType.LOG, "new match start") // TODO add more info
        broadcast(metadata, cycleTimeMsg);
    } // end if match starts


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