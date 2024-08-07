const serverless = require('serverless-http')
const app = require('./app')

// module.exports.handler = serverless(app)

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  console.log({ event, context })
  console.log({ envs: process.env })
  const result = await handler(event, context)
  console.log({ result })

  return result
}
