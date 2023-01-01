import { IMessage, MESSAGE_TYPE, TeamId } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

// TODO: move to rosetta
export interface ISkillsRankingData {
    rank: number,
    team: TeamId,
    total: number,
    highProgramming: number,
    numProgramming: number,
    highDriver: number,
    numDriver: number
}
export type ISkillsRankings = Array<ISkillsRankingData>;


let skills: ISkillsRankings;

export function postSkillsHandler(metadata: IMetadata, message: IMessage){
    skills = message.payload;
    record(metadata, LogType.LOG, "skills updated");
    broadcast(
        metadata,
        {
            type: MESSAGE_TYPE.POST,
            path: ['skills'],
            payload: skills
        }
    );
};

export function getSkillsHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, "skills requested");
    return {
        type: MESSAGE_TYPE.POST,
        path: ['skills'],
        payload: skills
    }
}