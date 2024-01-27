import { Injectable, Logger } from '@nestjs/common'
import * as dgram from 'dgram'

@Injectable()
export class BeaconService {
  private readonly logger = new Logger(BeaconService.name)
  private readonly server = dgram.createSocket('udp4')

  constructor () {
    this.server.on('listening', () => {
      const address = this.server.address()
      this.logger.log(`Listening for discovery requests on port ${address.port}`)
    })

    this.server.on('message', (message, remote) => {
      this.logger.log(`Received discovery request from ${remote.address}`)
      this.respond(remote.address)
    })

    this.server.bind(1818)
  }

  private respond (address: string): void {
    const client = dgram.createSocket('udp4')
    const message = Buffer.from('3002,3000')

    client.send(message, 0, message.length, 1819, address, (err) => {
      if (err != null) {
        this.logger.error(`Error sending response to ${address}: ${err.message}`)
      }

      client.close()
    })
  }
}
