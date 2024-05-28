const {
  getContractFactory,
} = require('../api/src/utils/contract-helper')

const authController = require('../api/src/presentation/controllers/auth-controller')
const userRepository = require('../api/src/infra/repositories/user-repository')

async function deployPurchaseEventProxy() {
  const contractFactory = await getContractFactory({ contractName: 'PurchaseEventProxy' })

  const deployContractTx = await contractFactory.deploy()
  await deployContractTx.waitForDeployment()
  const contractAddress = await deployContractTx.getAddress()

  return contractAddress
}

async function createFirstAdmin() {
  const { FIRST_ADM_USERNAME, FIRST_ADM_PASSWORD } = process.env
  if (!FIRST_ADM_USERNAME || !FIRST_ADM_PASSWORD) {
    throw new Error('Missing environment variables: FIRST_ADM_USERNAME, FIRST_ADM_PASSWORD')
  }

  const alreadyExists = await userRepository.findOne({ username: FIRST_ADM_USERNAME })
  if (alreadyExists) {
    return 'First admin already exists'
  }

  await authController.signup({
    body: {
      username: FIRST_ADM_USERNAME,
      password: FIRST_ADM_PASSWORD,
    },
  }).catch(() => null)

  const success = userRepository.findOne({ username: FIRST_ADM_USERNAME })
  if (!success) {
    throw new Error('Failed to create first admin')
  }

  return 'Success creating first admin'
}

async function main() {
  const [firstAdmin, contractAddress] = await Promise.allSettled([
    createFirstAdmin(),
    deployPurchaseEventProxy(),
  ])

  console.log('First admin:', firstAdmin.value)
  console.log('Contract address:', contractAddress.value)
}

main().catch(console.error).finally(() => process.exit(0))
