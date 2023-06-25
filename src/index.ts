import express from 'express'
import { router as eventNameRouter } from './routers/eventName'
import { router as stateRouter } from './routers/state'

export const app = express()
const port = 1818

app.use(express.json())
app.use('/eventName', eventNameRouter)
app.use('/state', stateRouter)

app.listen(port, () => {
  console.log(`REST API started on port ${port}`)
})
