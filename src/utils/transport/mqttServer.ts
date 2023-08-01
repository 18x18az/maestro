import { CustomTransportStrategy, Server } from '@nestjs/microservices'
import * as mqtt from 'mqtt'
import { makeValue } from '../string2json'

type Callback = (value: any, params: any) => Promise<void>

interface HandlerMap {
  [pattern: string]: Callback[]
}

export default class MqttServer extends Server implements CustomTransportStrategy {
  private readonly mqttClients: mqtt.MqttClient[] = []
  private handlers: HandlerMap = {}

  public async addHandler (pattern: any, callback: Callback, isEventHandler?: boolean, extras?: Record<string, any>): Promise<void> {
    if (this.handlers[pattern] !== undefined) {
      this.handlers[pattern].push(callback)
    } else {
      this.handlers[pattern] = [callback]
    }
  }

  public async listen (callback: () => void): Promise<void> {
    let connectedClients = 0

    Array.from(Object.entries(this.handlers)).forEach((value) => {
      const baseTopic = value[0]
      const paramNameRegex = /:([^/]+)/g
      const paramMatches = baseTopic.match(paramNameRegex)
      const paramKeys = (paramMatches != null) ? paramMatches.map((match) => match.slice(1)) : []
      const subscribedTopic = baseTopic.replaceAll(/:[^/]+/g, '+')
      const paramRegex = subscribedTopic.replaceAll('/', '\\/').replaceAll('+', '(.*)')
      const reCompiled = new RegExp(paramRegex)

      const mqttClient = mqtt.connect('ws://localhost:1883')
      this.mqttClients.push(mqttClient)

      mqttClient.on('connect', () => {
        mqttClient.subscribe(subscribedTopic)
        connectedClients++
        if (connectedClients === this.mqttClients.length) {
          callback()
        }
      })

      mqttClient.on('error', (err) => {
        this.logger.error(err)
      })

      mqttClient.on('message', (topic, message) => {
        const matches = reCompiled.exec(topic)?.slice(1)
        if (matches === undefined) {
          return
        }
        const params = {}
        paramKeys.forEach((key, index) => {
          params[key] = matches[index]
        })

        const msgString = message.toString()
        const value = makeValue(msgString)

        this.handlers[baseTopic].forEach((handler) => {
          void handler(value, params)
        })
      })
    })
  }

  close (): void {
    this.mqttClients.forEach((mqttClient) => {
      mqttClient.end()
    })
  }
}
