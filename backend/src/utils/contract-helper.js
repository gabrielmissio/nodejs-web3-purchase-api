const ethers = require('ethers')
const abiLoader = require('./abi-loader')
const { getSecret } = require('../infra/helper/secret-helper')

async function getContractFactory ({ contractName }) {
  const walletSigner = await getWalletSigner()
  const { abi, bytecode } = await abiLoader.loadABI(contractName)

  const contractFactory = new ethers.ContractFactory(abi, bytecode, walletSigner)

  return contractFactory
}

async function getContractInstance ({ contractName, contractAddress }) {
  const walletSigner = await getWalletSigner()
  const { abi } = await abiLoader.loadABI(contractName)

  const contract = new ethers.Contract(contractAddress, abi, walletSigner)
  const contractInstance = contract.connect(walletSigner)

  return contractInstance
}

async function getWalletSigner () {
  const provider = getProvider()
  const { accountKey } = await getSecret(process.env.ADMIN_KEY_SECRET_ARN)

  const walletSigner = new ethers.Wallet(accountKey, provider)

  return walletSigner
}

function getProvider () {
  const rcpUrl = `http://${process.env.RCP_PROVIDER_PRIVATE_IP}:8545`

  const provider = new ethers.JsonRpcProvider(rcpUrl)

  return provider
}

module.exports = {
  getContractFactory,
  getContractInstance,
  getWalletSigner,
  getProvider,
}
