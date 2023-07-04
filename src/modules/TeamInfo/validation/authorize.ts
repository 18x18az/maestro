import { Request, Response } from 'express'
import { isAuthorized } from '../../../utils/auth'
import { AUTH_TYPE } from '@18x18az/rosetta'

export async function authorize (req: Request, res: Response): Promise<boolean> {
  if (!(await isAuthorized(req, AUTH_TYPE.SERVICE))) {
    res.status(401).send('only services may submit team list')
    return false
  }

  return true
}
