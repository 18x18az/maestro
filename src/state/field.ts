import { FIELD_CONTROL, IFieldState, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
import { config } from "dotenv";

config();

const fs = require('fs');
const event = process.env.EVENT as string;
const eventFilePath = event + ".csv";

let fieldState: IFieldState;
let lastStartTime: number = 0;
let delta: number;
let cycleTimes : number[] = [];
let matches : string[] = [];
let rollingAvgCycleTime: number = 0;

// the number of cycle times to broadcast out
let numToSend: number = 6;

/**
 * Checks if a new match has started
 * The criteria for a new match to begin:
 * - we are in autonomous
 * - time remaining == 15
 * - match is not a prog. skills
 * 
 * If a new match has started, we broadcast the time since the last match has begun,
 * and save the match start time to a local csv file.
 */
function cycleTimeHandler(metadata: IMetadata){
    if(fieldState.control == FIELD_CONTROL.AUTONOMOUS && fieldState.timeRemaining == 15 && fieldState.match != 'P Skills'){
        delta = (Date.now() - lastStartTime)/60000;
        if(fieldState.match == 'Q1' || delta > 30){
            delta = 0;
        }
        else{ // if delta is nonzero then include it in rolling avg calculation
            cycleTimes.push(delta);
            matches.push(fieldState.match);
            rollingAvgCycleTime = 0;
            if(cycleTimes.length > numToSend) cycleTimes.shift(); 
            if(matches.length > numToSend) matches.shift();
            for(let i = 0; i < cycleTimes.length; i++){
                rollingAvgCycleTime += cycleTimes[i];
            }
            rollingAvgCycleTime /= cycleTimes.length;
        }
        lastStartTime = Date.now();

        // write data row to csv
        let dataRow = fieldState.match + ", " + new Date().toLocaleTimeString() + "\n";
        fs.writeFile(eventFilePath, dataRow, { flag: 'a+' }, (err:any) => {
            if(err != null){
                record(metadata, LogType.ERROR, "fs error: " + err.code);
            }
        })

        let cycleTimeMsg: IMessage = {
            type: MESSAGE_TYPE.POST,
            path: ["cycleTime"],
            payload: {
                rollingAvg: rollingAvgCycleTime,
                recentCycleTimes: cycleTimes,
                recentMatches: matches
            }
        };
        record(metadata, LogType.LOG, "new match start") // TODO add more info
        broadcast(metadata, cycleTimeMsg);
    } // end if match starts
}

export function postFieldHandler(metadata: IMetadata, message: IMessage) {
    fieldState = message.payload;

    // this checks for if a new match starts
    // if so, calculates cycle time
    cycleTimeHandler(metadata);


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