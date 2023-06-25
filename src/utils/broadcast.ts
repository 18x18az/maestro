import Aedes from 'aedes'
import { createServer } from 'http'
import { createWebSocketStream, Server } from 'ws'

const port = '1819'

const server = createServer()
const broker = new Aedes()
const wss = new Server({ server })
wss.on('connection', function (conn, req) {
  const stream = createWebSocketStream(conn)
  broker.handle(stream)
})

server.listen(port)
console.log(`MQTT broker listening on port ${port}`)

export async function broadcast (topic: string, payload: any): Promise<void> {
  broker.publish({
    topic,
    payload,
    cmd: 'publish',
    qos: 2,
    dup: false,
    retain: true
  }, (error) => {
    if (error != null) {
      console.log(error)
    }
  })
}
