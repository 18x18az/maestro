import { EventCode } from '@18x18az/rosetta'
import { Response } from 'express'

export function parse (body: EventCode, res: Response): EventCode | undefined {
  if (body.eventCode === undefined) {
    res.status(400).send('no event code')
    return
  }

  if (body.tmCode === undefined) {
    res.status(400).send('no TM code')
    return
  }

  return body
}
