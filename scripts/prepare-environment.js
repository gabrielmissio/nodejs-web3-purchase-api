const {
  getContractFactory,
} = require('../api/src/utils/contract-helper')

const blockcountRepository = require('../api/src/infra/repositories/blockcount-repository')
const userRepository = require('../api/src/infra/repositories/user-repository')
const authController = require('../api/src/presentation/controllers/auth-controller')

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
    return 'Missing environment variables: FIRST_ADM_USERNAME, FIRST_ADM_PASSWORD'
  }

  const alreadyExists = await userRepository.findOne({ username: FIRST_ADM_USERNAME })
  if (alreadyExists) {
    return 'First admin already exists'
  }

  const success = await authController.signup({
    body: {
      username: FIRST_ADM_USERNAME,
      password: FIRST_ADM_PASSWORD,
    },
  }, {
    // Mock express response object
    status: (code) => ({ json: () => code === 201 }),
  }).catch(() => false)

  return success
    ? 'Success creating first admin'
    : 'Failed to create first admin'
}

async function createBlockcount() {
  const alreadyExists = await blockcountRepository.findOne()
  if (alreadyExists) {
    return 'Blockcount already exists'
  }

  const success = await blockcountRepository.create(
    { lastFetchedBlock: 0 },
  ).catch(() => false)

  return success
    ? 'Success creating blockcount'
    : 'Failed to create blockcount'
}

async function main() {
  const [blockcount, firstAdmin, contractAddress] = await Promise.allSettled([
    createBlockcount(),
    createFirstAdmin(),
    deployPurchaseEventProxy(),
  ])

  console.log('Blockcount:', blockcount)
  console.log('First admin:', firstAdmin)
  console.log('Event proxy contract address:', contractAddress)
}

main().catch(console.error).finally(() => process.exit(0))
