const express = require('express')
const routes = require('./routes')
const corsMiddleware = require('./middlewares/cors')

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(corsMiddleware)
app.use(routes)

module.exports = app
