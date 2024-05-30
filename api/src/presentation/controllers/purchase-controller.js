const {
  getContractFactory,
  getContractInstance,
} = require('../../utils/contract-helper')
const purchaseStates = require('../../utils/purchase-states')
const purchaseRepository = require('../../infra/repositories/purchase-repository')

async function publishPurchase (req, res) {
  try {
    const { name, value } = req.body  // value is in wei

    // const contractFactory = await getContractFactory({ contractName: 'PurchaseEventProxy' })
    const contractFactory = await getContractFactory({ contractName: 'Purchase' })
    // const deployContractTx = await contractFactory.deploy()
    const deployContractTx = await contractFactory.deploy('0x5FbDB2315678afecb367f032d93F642f64180aa3', { value })
    await deployContractTx.waitForDeployment()
    const contractAddress = await deployContractTx.getAddress()

    await purchaseRepository.create({
      name,
      price: value,
      state: purchaseStates[purchaseStates.CREATED],
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

    const contractInstance = getContractInstance({
      contractName: 'Purchase', contractAddress,
    })

    const purchaseState = await contractInstance.state()
    if (parseInt(purchaseState, 16) !== purchaseStates.CREATED) {
      // NOTE: The Smart Contract already handles this case, but you can save some gas by checking it here
      return res.status(400).json({ error: `Purchase can't be aborted in the '${purchaseStates[purchaseState]}' state` })
    }

    const abortTx = await contractInstance.abort()
    const txReceipt = await abortTx.wait() // NOTE: Maybe it's better don't wait for the transaction to be mined (review it later)
    // await purchaseRepository.updateOne({ contractAddress }, { isActive: false })

    return res.status(200).json({ message: 'Purchase aborted', txReceipt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function settleFunds (req, res) {
  try {
    const { contractAddress } = req.body

    const contractInstance = getContractInstance({
      contractName: 'Purchase', contractAddress,
    })

    const purchaseState = await contractInstance.state()
    if (parseInt(purchaseState, 16) !== purchaseStates.RELEASE) {
      // NOTE: The Smart Contract already handles this case, but you can save some gas by checking it here
      return res.status(400).json({ error: `Funds can't be settled in the '${purchaseStates[purchaseState]}' state` })
    }

    const settleFundsTx = await contractInstance.refundSeller()
    const txReceipt = await settleFundsTx.wait() // NOTE: Maybe it's better don't wait for the transaction to be mined (review it later)
    // await purchaseRepository.updateOne({ contractAddress }, { isActive: false })

    return res.status(200).json({ message: 'Settled funds ', txReceipt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function listProducts (req, res) {
  try {
    const { page, limit, ...searchParams } = req.query

    // TODO: Only use "and" operator when there are multiple search params
    const filter = {
      $and: Object.keys(searchParams).map((key) => {
        return searchParams[key].includes(',')
          ? { '$or': searchParams[key].split(',').map((subKey) => ({ [key]: subKey })) }
          : { [key]: searchParams[key] }
      }),
    }
    const offset = (page - 1) * limit
    const [products, productsCount] = await Promise.all([
      purchaseRepository.find(filter).skip(offset).limit(limit),
      purchaseRepository.countDocuments(filter),
    ])

    const parsedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      state: product.state,
      isActive: product.isActive,
      contractAddress: product.contractAddress,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    const result = {
      data: parsedProducts,
      meta: {
        page,
        next: productsCount > offset + limit ? page + 1 : null,
        total: productsCount,
        limit,
      },
    }

    return res.status(200).json(result)
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
