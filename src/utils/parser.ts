import { AedesPublishPacket } from 'aedes'

export function getMessageString (packet: AedesPublishPacket): string {
  return packet.payload.toString().slice(1, -1)
}
