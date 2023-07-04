import { Request, Response } from 'express'
import { TeamInfo } from '@18x18az/rosetta'
import { authorize } from './authorize'

export async function validate (req: Request, res: Response): Promise<TeamInfo[] | undefined> {
  if (!(await authorize(req, res))) {
    return
  }

  return req.body
}
