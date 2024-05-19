const { getContractFactory } = require('../../utils/contract-helper')

async function publishProduct (req, res) {
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

module.exports = {
  publishProduct,
}
