import { Request } from 'express'

export enum AUTH_TYPE {
  LOCAL = 'LOCAL',
  ADMIN = 'ADMIN'
}

export async function isAuthorized (req: Request, level: AUTH_TYPE): Promise<boolean> {
  const source = req.ip

  // localhost automatically fully authorized
  if (source === '::1') {
    return true
  }

  if (level === AUTH_TYPE.LOCAL) {
    return false
  }

  return false
}
