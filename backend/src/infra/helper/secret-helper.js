const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager')

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION,
})

const dumbCache = new Map()

async function getSecret(secretArn) {
  try {
    console.log('Getting secret...')
    if (dumbCache.has(secretArn)) {
      console.log('Got secret from cache...')
      return dumbCache.get(secretArn)
    }

    const command = new GetSecretValueCommand({ SecretId: secretArn })
    const response = await client.send(command)
    console.log('Got secret from AWS...')

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

module.exports = { getSecret }
