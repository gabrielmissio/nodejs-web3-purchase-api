const fs = require('fs')
const path = require('path')
const ethers = require('ethers')

function getContractFactory ({ network, contractName }) {
  const walletSigner = getWalletSigner({ network })
  const { abi, bytecode } = loadMetadata({ contractName })

  const contractFactory = new ethers.ContractFactory(abi, bytecode, walletSigner)

  return contractFactory
}

function getContractInstance ({ network, contractName, contractAddress }) {
  const walletSigner = getWalletSigner({ network })
  const { abi } = loadMetadata({ contractName })

  const contract = new ethers.Contract(contractAddress, abi, walletSigner)
  const contractInstance = contract.connect(walletSigner)

  return contractInstance
}

function getWalletSigner ({ network, key }) {
  const { rcpUrl, accountKey } = getNetworkConfig(network)

  const provider = new ethers.JsonRpcProvider(rcpUrl)
  const walletSigner = new ethers.Wallet(key || accountKey, provider)

  return walletSigner
}

function getProvider () {
  const { rcpUrl } = getNetworkConfig()

  const provider = new ethers.JsonRpcProvider(rcpUrl)

  return provider
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
}
