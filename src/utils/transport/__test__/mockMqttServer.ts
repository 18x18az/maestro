import { CustomTransportStrategy, Server } from '@nestjs/microservices'
import { from } from 'rxjs'

class MockMqttServer extends Server implements CustomTransportStrategy {
  async listen (callback: () => void): Promise<void> {
    callback()
  }

  async close (): Promise<void> {
    // Nothing to close
  }
}

export class MockTransport {
  private readonly mockServer: MockMqttServer
  constructor () {
    this.mockServer = new MockMqttServer()
  }

  getStrategy (): { strategy: MockMqttServer } {
    return { strategy: this.mockServer }
  }

  async mockEvent (topic: string, data: any): Promise<void> {
    const handler = this.mockServer.getHandlerByPattern(topic)

    if (handler == null) {
      throw new Error(`No handler for topic ${topic}`)
    }

    const context = {}
    await new Promise((resolve, reject) => {
      this.mockServer.send(from(handler(data, context)), (response) => {
        resolve(response)
      })
    })
  }
}
