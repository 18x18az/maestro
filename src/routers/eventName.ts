import express from 'express'
import { controller } from '../routes/eventName'

export const router = express.Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', controller)
