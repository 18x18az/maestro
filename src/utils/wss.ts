import WebSocket from "ws";
import { getNextId, record, IMetadata, LogType } from "./log";
import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { messageHandler } from "..";

let connectionPool = 0;

const connectionTable: { [id: string]: WebSocket } = {};

export type IConnectionId = string;

export function addConnection(metadata: IMetadata, ws: WebSocket): IConnectionId {
    record(metadata, LogType.LOG, "new connection");
    const connection = (connectionPool++).toString();
    connectionTable[connection] = ws;
    metadata.connection = connection;
    record(metadata, LogType.LOG, "assigned a connection ID");

    return connection;
}

export function removeConnection(metadata: IMetadata) {
    delete connectionTable[metadata.connection as IConnectionId];
    record(metadata, LogType.LOG, "connection closed");
}

const wss = new WebSocket.Server({
    port: 8081
});

function send(metadata: IMetadata, ws: WebSocket, message: IMessage) {
    record(metadata, LogType.LOG, `TX - ${message}`);
    ws.send(JSON.stringify(message));
}

export function broadcast(metadata: IMetadata, message: IMessage) {
    for (const ws of Object.values(connectionTable)) {
        send(metadata, ws, message);
    }
}

wss.on('connection', function connection(ws) {
    const id = getNextId();
    const metadata: IMetadata = { id, connection: null }
    const connection = addConnection(metadata, ws);
    connectionTable[connection] = ws;
    ws.on('message', function message(data) {
        const message = JSON.parse(data.toString()) as IMessage;
        const id = getNextId();
        const metadata: IMetadata = { id, connection };
        record(metadata, LogType.LOG, `RX - ${JSON.stringify(message)}`);
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