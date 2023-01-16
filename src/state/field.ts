import { FIELD_CONTROL, IFieldState, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
import { config } from "dotenv";
import { Studio } from "../managers/obs";
import { onAutoEnd as onAutoEndStage, onAutoStart as onAutoStartStage, onDriverEnd as onDriverEndStage, onDriverStart as onDriverStartStage } from "./matchStage";
import { queueMatch } from "../utils/fieldControl";
config();

const fs = require('fs');
const event = process.env.EVENT as string;
const eventFilePath = event + ".csv";

let fieldState: IFieldState;
let prevFieldState: IFieldState;
let lastStartTime: number = 0;
let delta: number;
let cycleTimes: number[] = [];
let matches: string[] = [];
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
function cycleTimeHandler(metadata: IMetadata) {
    delta = (Date.now() - lastStartTime) / 60000;
    if (fieldState.match == 'Q1' || delta > 30) {
        delta = 0;
    }
    else { // if delta is nonzero then include it in rolling avg calculation
        cycleTimes.push(delta);
        matches.push(fieldState.match);
        rollingAvgCycleTime = 0;
        if (cycleTimes.length > numToSend) cycleTimes.shift();
        if (matches.length > numToSend) matches.shift();
        for (let i = 0; i < cycleTimes.length; i++) {
            rollingAvgCycleTime += cycleTimes[i];
        }
        rollingAvgCycleTime /= cycleTimes.length;
    }
    lastStartTime = Date.now();

    // write data row to csv
    let dataRow = fieldState.match + ", " + new Date().toLocaleTimeString() + "\n";
    fs.writeFile(eventFilePath, dataRow, { flag: 'a+' }, (err: any) => {
        if (err != null) {
            record(metadata, LogType.ERROR, "fs error: " + err.code);
        }
    })

    record(metadata, LogType.LOG, `Rolling cycle time of ${rollingAvgCycleTime}`);

    let cycleTimeMsg: IMessage = {
        type: MESSAGE_TYPE.POST,
        path: ["cycleTime"],
        payload: {
            rollingAvg: rollingAvgCycleTime,
            recentCycleTimes: cycleTimes,
            recentMatches: matches
        }
    };
    broadcast(metadata, cycleTimeMsg);
}

async function onFieldChanged(fieldState: IFieldState, meta: IMetadata) {
    record(meta, LogType.LOG, `Match ${fieldState.match} queued on field ${fieldState.field}`);
    await Studio.setField(fieldState.field);
}

async function onAutoStart(metadata: IMetadata) {
    await onAutoStartStage(metadata);
    cycleTimeHandler(metadata);
}

async function onAutoEnd(metadata: IMetadata) {
    await onAutoEndStage(metadata);
}

async function onDriverStart(metadata: IMetadata) {
    await onDriverStartStage(metadata);
}

async function onDriverEnd(metadata: IMetadata) {
    await onDriverEndStage(metadata);
}

async function onTimeoutStart(metadata: IMetadata) {
    record(metadata, LogType.LOG, 'Timeout started');
}

async function onTimeoutEnd(metadata: IMetadata) {
    record(metadata, LogType.LOG, 'Timeout over');
    await queueMatch(metadata);
}

async function onTimeoutChange(metadata: IMetadata, previous: IFieldState, current: IFieldState) {
    if (previous.control === FIELD_CONTROL.DISABLED && current.control === FIELD_CONTROL.TIMEOUT) {
        await onTimeoutStart(metadata);
    } else if (previous.control === FIELD_CONTROL.TIMEOUT && current.control === FIELD_CONTROL.DISABLED) {
        await onTimeoutEnd(metadata);
    } else {
        record(metadata, LogType.ERROR, `Unhandled timeout change from ${previous.control} to ${current.control}`);
    }
}

async function onSkillsStateChange(metadata: IMetadata, previous: IFieldState, current: IFieldState) {
    record(metadata, LogType.LOG, `Skills change from ${previous.control} to ${current.control}`);
}

async function onMatchStateChange(metadata: IMetadata, previous: IFieldState, current: IFieldState) {
    if (previous.control === FIELD_CONTROL.DISABLED && current.control === FIELD_CONTROL.AUTONOMOUS) {
        await onAutoStart(metadata);
    } else if (previous.control === FIELD_CONTROL.AUTONOMOUS && current.control === FIELD_CONTROL.PAUSED) {
        await onAutoEnd(metadata);
    } else if (previous.control === FIELD_CONTROL.PAUSED && current.control === FIELD_CONTROL.DRIVER) {
        await onDriverStart(metadata);
    } else if (previous.control === FIELD_CONTROL.DRIVER && current.control === FIELD_CONTROL.DISABLED) {
        await onDriverEnd(metadata);
    } else {
        record(metadata, LogType.ERROR, `Unhandled match change from ${previous.control} to ${current.control}`);
    }
}

async function onFieldStateChange(metadata: IMetadata, previous: IFieldState, current: IFieldState) {
    const match = current.match;

    if (match === 'P Skills' || match === 'D Skills') {
        await onSkillsStateChange(metadata, previous, current);
    } else if (match === 'TO') {
        await onTimeoutChange(metadata, previous, current);
    } else {
        await onMatchStateChange(metadata, previous, current);
    }
}

export async function postFieldHandler(metadata: IMetadata, message: IMessage) {
    fieldState = message.payload;

    if (prevFieldState && fieldState.field !== prevFieldState.field) {
        await onFieldChanged(fieldState, metadata);
    }

    if (prevFieldState && prevFieldState.control !== fieldState.control) {
        await onFieldStateChange(metadata, prevFieldState, fieldState);
    }

    prevFieldState = fieldState;
    record(metadata, LogType.DATA, `${fieldState.match} on ${fieldState.field} - ${fieldState.timeRemaining}`)
    broadcast(metadata, message);

}

export function getFieldHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, "field state requested");
    return {
        type: MESSAGE_TYPE.POST,
        path: ["field"],
        payload: fieldState
    }
}