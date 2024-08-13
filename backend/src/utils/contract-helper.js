const ethers = require('ethers')
const abiLoader = require('./abi-loader')

async function getContractFactory ({ contractName }) {
  const walletSigner = getWalletSigner()
  const { abi, bytecode } = await abiLoader.loadABI(contractName)

  const contractFactory = new ethers.ContractFactory(abi, bytecode, walletSigner)

  return contractFactory
}

async function getContractInstance ({ contractName, contractAddress }) {
  const walletSigner = getWalletSigner()
  const { abi } = await abiLoader.loadABI(contractName)

  const contract = new ethers.Contract(contractAddress, abi, walletSigner)
  const contractInstance = contract.connect(walletSigner)

  return contractInstance
}

function getWalletSigner () {
  const { rcpUrl, accountKey } = getNetworkConfig()

  const provider = new ethers.JsonRpcProvider(rcpUrl)
  const walletSigner = new ethers.Wallet(accountKey, provider)

  return walletSigner
}

function getProvider () {
  const { rcpUrl } = getNetworkConfig()

  const provider = new ethers.JsonRpcProvider(rcpUrl)

  return provider
}

function getNetworkConfig () {
  const accounts = [process.env.ACCOUNT_KEY]
  const url = `http://${process.env.RCP_PROVIDER_PRIVATE_IP}:8545`

  return {
    rcpUrl: url,
    accountKey: accounts[0],
  }
}

module.exports = {
  getContractFactory,
  getContractInstance,
  getWalletSigner,
  getProvider,
}
