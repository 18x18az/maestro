import { AedesPublishPacket } from 'aedes'

export function getMessageString (packet: AedesPublishPacket): string {
  if (packet.payload === undefined) {
    return ''
  }
  return packet.payload.toString().slice(1, -1)
}
