import { broadcast } from '../utils/broadcast'

const eventName = ''

export async function setEventName (name: string): Promise<void> {
  void broadcast('/eventName', name)
  console.log(`Event name is now ${name}`)
}

export async function getEventName (): Promise<String> {
  return eventName
}

export async function setup (): Promise<void> {
  console.log('Getting event name')
}

void setup()
