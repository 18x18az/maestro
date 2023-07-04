import { Request, Response } from 'express'
import { authorize } from './authorize'

export async function validate (req: Request, res: Response): Promise<Boolean> {
  return authorize(req, res)
}
