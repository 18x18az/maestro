import { IMessage, MATCH_STAGE, MESSAGE_TYPE } from "@18x18az/rosetta";
import { Studio } from "../managers/obs";
import { Director } from "../managers/stream";
import { queueMatch } from "../utils/fieldControl";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

const STINGER_DELAY_SECONDS = 1;
const INTRO_DELAY_SECONDS = 2;
const FIELD_LINGER_SECONDS = 5;
const SCORE_DELAY_SECONDS = 2;

let currentStage: MATCH_STAGE = MATCH_STAGE.IDLE;

export function getMatchStage(){
    return currentStage;
}

async function changeStage(stage: MATCH_STAGE, meta: IMetadata) {
    record(meta, LogType.LOG, `Match stage is now ${stage}`)
    currentStage = stage;
    const message: IMessage = {
        type: MESSAGE_TYPE.POST,
        path: ['matchStage'],
        payload: stage
    }
    await broadcast(meta, message);

    switch (stage) {
        case MATCH_STAGE.IDLE: {
            break;
        }
        case MATCH_STAGE.STING_IN: {
            await Studio.triggerTransition();
            setTimeout(() => {intro(meta)}, INTRO_DELAY_SECONDS * 1000);
            setTimeout(Director.setAudience, STINGER_DELAY_SECONDS * 1000);
            break;
        }
        case MATCH_STAGE.INTRO: {
            break;
        }
        case MATCH_STAGE.AUTONOMOUS: {
            break;
        }
        case MATCH_STAGE.PAUSED: {
            break;
        }
        case MATCH_STAGE.DRIVER: {
            break;
        }
        case MATCH_STAGE.OUTRO: {
            setTimeout(() => {stingOut(meta)}, FIELD_LINGER_SECONDS * 1000);
            break;
        }
        case MATCH_STAGE.STING_OUT: {
            await Studio.triggerTransition();
            setTimeout(() => {idle(meta)}, SCORE_DELAY_SECONDS * 1000);
            setTimeout(() => {queueMatch(meta)}, STINGER_DELAY_SECONDS * 1000);
            break;
        }
    }
}

export async function displayMatch(meta: IMetadata) {
    await changeStage(MATCH_STAGE.STING_IN, meta);
}

export async function onAutoStart(meta: IMetadata) {
    await changeStage(MATCH_STAGE.AUTONOMOUS, meta);
}

export async function onAutoEnd(meta: IMetadata) {
    await changeStage(MATCH_STAGE.PAUSED, meta);
}

export async function onDriverStart(meta: IMetadata) {
    await changeStage(MATCH_STAGE.DRIVER, meta);
}

export async function onDriverEnd(meta: IMetadata) {
    await changeStage(MATCH_STAGE.OUTRO, meta);
}

async function intro(meta: IMetadata) {
    await changeStage(MATCH_STAGE.INTRO, meta);
}

async function stingOut(meta: IMetadata) {
    await changeStage(MATCH_STAGE.STING_OUT, meta);
}

async function idle(meta: IMetadata) {
    await changeStage(MATCH_STAGE.IDLE, meta);
}