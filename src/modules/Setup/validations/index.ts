import { Request, Response } from 'express'
import { EventCode } from '@18x18az/rosetta'
import { authorize } from './authorize'
import { parse } from './parse'

export async function validate (req: Request, res: Response): Promise<EventCode | undefined> {
  if (!(await authorize(req, res))) {
    return
  }

  return parse(req.body, res)
}
