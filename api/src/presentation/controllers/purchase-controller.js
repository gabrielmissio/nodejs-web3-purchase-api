const {
  getContractFactory,
  getContractInstance,
} = require('../../utils/contract-helper')

async function publishPurchase (req, res) {
  try {
    const { value } = req.body  // value is in wei

    const contractFactory = await getContractFactory({ contractName: 'Purchase' })
    const deployContractTx = await contractFactory.deploy({ value })
    await deployContractTx.waitForDeployment()
    const contractAddress = await deployContractTx.getAddress()

    return res.status(201).json({ contractAddress })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function abortPurchase (req, res) {
  try {
    const { contractAddress } = req.body

    const contractInstance = await getContractInstance({ contractName: 'Purchase', contractAddress })
    const abortTx = await contractInstance.abort()

    // NOTE: Maybe it's better don't wait for the transaction to be mined (review it later)
    const txReceipt = await abortTx.wait()

    return res.status(200).json({ message: 'Purchase aborted', txReceipt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function settleFunds (req, res) {
  try {
    const { contractAddress } = req.body

    const contractInstance = await getContractInstance({ contractName: 'Purchase', contractAddress })
    const abortTx = await contractInstance.refundSeller()

    // NOTE: Maybe it's better don't wait for the transaction to be mined (review it later)
    const txReceipt = await abortTx.wait()

    return res.status(200).json({ message: 'Settled funds ', txReceipt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  publishPurchase,
  abortPurchase,
  settleFunds,
}
