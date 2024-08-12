const express = require('express')
const corsMiddleware = require('../../middlewares/cors')

const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(corsMiddleware)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.all('*', (req, res) => {
  res.send('You should not be here')
})

app.listen(3000, () => {
  console.log('Customer app listening on port 3000!')
})
