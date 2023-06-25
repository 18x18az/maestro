import express from 'express'
import { router as eventNameRouter } from './routers/eventName'

export const app = express()
const port = 1818

app.use(express.json())
app.use('/eventName', eventNameRouter)

app.listen(port, () => {
  console.log(`REST API started on port ${port}`)
})
