import { Request, Response } from 'express'
import { AUTH_TYPE, isAuthorized } from '../../../utils/auth'

export async function authorize (req: Request, res: Response): Promise<boolean> {
  if (!(await isAuthorized(req, AUTH_TYPE.LOCAL))) {
    res.status(401).send('only localhost may perform initial setup')
    return false
  }

  return true
}
