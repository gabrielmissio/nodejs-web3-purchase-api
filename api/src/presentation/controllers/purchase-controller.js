const {
  getContractFactory,
  getContractInstance,
} = require('../../utils/contract-helper')
const purchaseStates = require('../../utils/purchase-states')
const purchaseRepository = require('../../infra/repositories/purchase-repository')

async function publishPurchase (req, res) {
  try {
    const { name, value } = req.body  // value is in wei

    const contractFactory = await getContractFactory({ contractName: 'Purchase' })
    const deployContractTx = await contractFactory.deploy({ value })
    await deployContractTx.waitForDeployment()
    const contractAddress = await deployContractTx.getAddress()

    await purchaseRepository.create({
      name,
      price: value,
      contractAddress,
    })

    return res.status(201).json({ contractAddress })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function abortPurchase (req, res) {
  try {
    const { contractAddress } = req.body

    const contractInstance = await getContractInstance({
      contractName: 'Purchase', contractAddress,
    })

    const purchaseState = await contractInstance.state()
    if (parseInt(purchaseState, 16) !== purchaseStates.CREATED) {
      // NOTE: The Smart Contract already handles this case, but you can save some gas by checking it here
      return res.status(400).json({ error: `Purchase can't be aborted in the '${purchaseStates[purchaseState]}' state` })
    }

    const abortTx = await contractInstance.abort()
    const txReceipt = await abortTx.wait() // NOTE: Maybe it's better don't wait for the transaction to be mined (review it later)

    return res.status(200).json({ message: 'Purchase aborted', txReceipt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function settleFunds (req, res) {
  try {
    const { contractAddress } = req.body

    const contractInstance = await getContractInstance({
      contractName: 'Purchase', contractAddress,
    })

    const purchaseState = await contractInstance.state()
    if (parseInt(purchaseState, 16) !== purchaseStates.RELEASE) {
      // NOTE: The Smart Contract already handles this case, but you can save some gas by checking it here
      return res.status(400).json({ error: `Funds can't be settled in the '${purchaseStates[purchaseState]}' state` })
    }

    const settleFundsTx = await contractInstance.refundSeller()
    const txReceipt = await settleFundsTx.wait() // NOTE: Maybe it's better don't wait for the transaction to be mined (review it later)

    return res.status(200).json({ message: 'Settled funds ', txReceipt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function listProducts (req, res) {
  try {
    const products = await purchaseRepository.find()
    const parsedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      contractAddress: product.contractAddress,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    return res.status(200).json({ data: parsedProducts })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  publishPurchase,
  abortPurchase,
  settleFunds,
  listProducts,
}
