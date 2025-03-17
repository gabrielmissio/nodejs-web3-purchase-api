const mongoose = require('mongoose')
const { getSecret } = require('./secret-helper')

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log('=> using existing database connection')
    return Promise.resolve()
  }

  const secret = await getSecret(process.env.DOCUMENTDB_SECRET_ARN)
  const { username, password, port } = secret

  // Construct the DocumentDB connection URI
  const encodedUsername = encodeURIComponent(username)
  const encodedPassword = encodeURIComponent(password)
  const clusterEndpoint = process.env.DOCUMENTDB_ENDPOINT
  const dbName = 'mydatabase' // Replace with your actual database name
  const mongoUri = `mongodb://${encodedUsername}:${encodedPassword}@${clusterEndpoint}:${port}/${dbName}?ssl=true${process.env.USE_DOCDB_CERTIFICATE === 'true' ? '&tlsCAFile=global-bundle.pem' : ''}&retryWrites=false`

  console.log('=> using new database connection')
  await mongoose.connect(mongoUri)
  isConnected = true
}

module.exports = { connectDB }
