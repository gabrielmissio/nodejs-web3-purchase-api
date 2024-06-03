const fs = require('fs')
const path = require('path')
const ethers = require('ethers')

function getContractFactory ({ contractName }) {
  const walletSigner = getWalletSigner()
  const { abi, bytecode } = loadMetadata({ contractName })

  const contractFactory = new ethers.ContractFactory(abi, bytecode, walletSigner)

  return contractFactory
}

function getContractInstance ({ contractName, contractAddress }) {
  const walletSigner = getWalletSigner()
  const { abi } = loadMetadata({ contractName })

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

function weiToEth (wei) {
  return ethers.formatEther(wei)
}

function getNetworkConfig () {
  const accounts = [process.env.ACCOUNT_KEY]
  const url = process.env.RCP_URL

  return {
    rcpUrl: url,
    accountKey: accounts[0],
  }
}

function loadMetadata ({ contractName = '' }) {
  const abisPath = '../../../blockchain/abis'
  const metadataPath = path.resolve(__dirname, abisPath, `${contractName}.json`) // TODO: ensure path exists

  const metadata = JSON.parse(fs.readFileSync(metadataPath))

  return metadata
}

module.exports = {
  getContractFactory,
  getContractInstance,
  getWalletSigner,
  getProvider,
  weiToEth,
}
