const { connectDB } = require('../../infra/helper/db-helper')
const serverless = require('serverless-http')
const app = require('./app')

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  console.log({ event, context })
  console.log({ envs: process.env })

  console.log('=> connecting to database')
  await connectDB()

  const result = await handler(event, context)
  console.log({ result })

  return result
}
