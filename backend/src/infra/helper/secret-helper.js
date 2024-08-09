const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager')

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION,
})

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

module.exports = { getSecret }
