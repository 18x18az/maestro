import WebSocket from "ws";
import { getNextId, record, IMetadata, LogType } from "./log";
import { IMessage } from "@18x18az/rosetta";
import { messageHandler } from "..";
import { config } from "dotenv";

config();

const port = parseInt(process.env.WS_PORT as string);

let connectionPool = 0;

const connectionTable: { [id: string]: WebSocket } = {};

export type IConnectionId = string;

function connectionTableStatus(metadata: IMetadata) {
    record(metadata, LogType.LOG, `there are ${Object.keys(connectionTable).length} active connections`)
}

export function addConnection(metadata: IMetadata, ws: WebSocket): IConnectionId {
    record(metadata, LogType.DATA, "new connection");
    const connection = (connectionPool++).toString();
    connectionTable[connection] = ws;
    metadata.connection = connection;
    record(metadata, LogType.DATA, "assigned a connection ID");
    connectionTableStatus(metadata);

    return connection;
}

export function removeConnection(metadata: IMetadata) {
    delete connectionTable[metadata.connection as IConnectionId];
    record(metadata, LogType.LOG, "connection closed");
    connectionTableStatus(metadata);
}

const wss = new WebSocket.Server({
    port
});

function send(metadata: IMetadata, ws: WebSocket, message: IMessage) {
    record(metadata, LogType.DATA, JSON.stringify(message));
    ws.send(JSON.stringify(message));
}

export async function broadcast(metadata: IMetadata, message: IMessage) {
    record(metadata, LogType.DATA, "broadcasting");
    for (const ws of Object.values(connectionTable)) {
        send(metadata, ws, message);
    }

    // send to bifrost
    if (process.env.BIFROST_URL as string) {
        try {
            const response = await fetch(process.env.BIFROST_URL as string,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "talos-key": process.env.BIFROST_KEY as string,
                    },
                    body: JSON.stringify(message)
                });
        } catch (err: any) {
            console.error(err.message);
        }
    }

}

wss.on('connection', function connection(ws) {
    const id = getNextId();
    const metadata: IMetadata = { id, connection: null }
    const connection = addConnection(metadata, ws);

    ws.on('message', function message(data) {
        const message = JSON.parse(data.toString()) as IMessage;
        const id = getNextId();
        const metadata: IMetadata = { id, connection };
        record(metadata, LogType.DATA, `RX`);
        record(metadata, LogType.DATA, JSON.stringify(message));
        const reply = messageHandler(metadata, message);
        if (reply) {
            send(metadata, ws, reply);
        }
    });

    ws.on('close', function close() {
        const id = getNextId();
        const metadata: IMetadata = { id, connection };
        removeConnection(metadata);
    });
});