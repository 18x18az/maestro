import Aedes from 'aedes'
import { createServer } from 'net'

const broker = new Aedes()
const server = createServer(broker.handle)

server.listen('1819', function () {
  console.log('MQTT broker started')
})

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
