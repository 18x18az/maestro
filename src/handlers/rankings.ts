import { IMessage, MESSAGE_TYPE, TeamId } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

// TODO: move to rosetta
export interface IRankingData {
    rank: number,
    team: TeamId,
    avgWP: number,
    avgAP: number,
    avgSP: number,
    record: string
};

export type IRankings = Array<IRankingData>;

let rankings: IRankings;


export function postRankingsHandler(metadata: IMetadata, message: IMessage){
    rankings = message.payload;
    record(metadata, LogType.LOG, "rankings updated");
    broadcast(
        metadata,
        {
            type: MESSAGE_TYPE.POST,
            path: ['rankings'],
            payload: rankings
        }
    );
};

export function getRankingsHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, "rankings requested");
    return {
        type: MESSAGE_TYPE.POST,
        path: ['rankings'],
        payload: rankings
    }
}