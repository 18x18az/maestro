import Aedes from 'aedes'
import { createServer } from 'http'
import { createWebSocketStream, Server } from 'ws'

const port = '1883'

const server = createServer()
export const broker = new Aedes()
const wss = new Server({ server })
wss.on('connection', function (conn, req) {
  const stream = createWebSocketStream(conn)
  broker.handle(stream)
})

broker.on('clientError', (client, error) => {
  console.log(error)
})

server.listen(port)
console.log(`MQTT on port ${port}`)
