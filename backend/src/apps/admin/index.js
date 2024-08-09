const mongoose = require('mongoose')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

const client = new SecretsManagerClient({ region: process.env.AWS_REGION })

async function getSecret(secretArn) {
  try {
    console.log('Getting secret...')
    const command = new GetSecretValueCommand({ SecretId: secretArn })
    const response = await client.send(command)
    console.log('Got secret...')

    if (response.SecretString) {
      return JSON.parse(response.SecretString)
    } else {
      throw new Error('SecretString not found')
    }
  } catch (error) {
    console.error('Error getting secret:', error)
    throw error
  }
}



let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> using existing database connection')
    return Promise.resolve()
  }

  // Construct the DocumentDB connection URI
  const secret = await getSecret(process.env.DOCUMENTDB_SECRET_ARN)
  const { username, password, port } = secret
  const clusterEndpoint = process.env.DOCUMENTDB_ENDPOINT // Passed as an environment variable
  const dbName = 'mydatabase' // Replace with your actual database name
  const mongoUri = `mongodb://${username}:${password}@${clusterEndpoint}:${port}/${dbName}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`

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
