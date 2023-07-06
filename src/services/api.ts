import { Router } from 'express'
import { app } from './express'
import bodyParser from 'body-parser'

const port = 80

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

export const apiRouter = Router()
app.use('/api', apiRouter)

const listener = app.listen(port, () => {
  const address = listener.address()
  if (address !== null && typeof address !== 'string') {
    console.log(`HTTP on port ${address.port.toString()}`)
  }
})
