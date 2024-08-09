const mongoose = require('mongoose')

// Construct the DocumentDB connection URI
const username = 'masterAdmin'
const password = 'SecurePassword123'
const clusterEndpoint = process.env.DOCUMENTDB_ENDPOINT // Passed as an environment variable
const dbName = 'mydatabase' // Replace with your actual database name

const mongoUri = `mongodb://${username}:${password}@${clusterEndpoint}:27017/${dbName}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`

let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> using existing database connection')
    return Promise.resolve()
  }

  console.log('=> using new database connection')
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  isConnected = true
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectToDatabase()
    const message = 'Successfully connected to DocumentDB!'
    console.log(message)

    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    }
  } catch (error) {
    console.error('Error connecting to DocumentDB:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to connect to DocumentDB' }),
    }
  }
}


// const serverless = require('serverless-http')
// const app = require('./app')

// const handler = serverless(app)
// module.exports.handler = async (event, context) => {
//   console.log({ event, context })
//   console.log({ envs: process.env })

//   const result = await handler(event, context)
//   console.log({ result })

//   return result
// }
