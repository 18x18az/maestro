import { broker } from '../services/mqtt'

export async function broadcast (topic: string, payload: any): Promise<void> {
  console.log(`Publishing ${String(payload)} to ${topic}`)
  broker.publish({
    topic,
    payload: JSON.stringify(payload),
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
