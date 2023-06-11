import express from 'express'
import { controller } from '../routes/eventName'

export const router = express.Router()

router.post('/', controller)
