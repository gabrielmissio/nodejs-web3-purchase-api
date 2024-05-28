// Smart Contract event listeners are a common pattern in blockchain applications.
// They allow you to react to events emitted by Smart Contracts, such as a purchase being confirmed or a refund being requested.

const {
  getContractInstance,
} = require('./utils/contract-helper')
const purchaseEvents = require('./utils/purchase-events')
const purchaseRepository = require('./infra/repositories/purchase-repository')

function listen(callback) {
  const contractInstance = getContractInstance({
    contractName: 'PurchaseEventProxy',
    contractAddress: process.env.PURCHASE_EVENT_PROXY_ADDRESS,
  })
  contractInstance.on('PurchaseStateChange', eventHandler)

  if (callback && typeof callback === 'function') {
    callback()
  }
}

async function eventHandler(contractAddress, state) {  // , event) {
  try {
    console.log(`Purchase Contract Address: ${contractAddress}`)
    // console.log(`State: ${purchaseEvents[state]}`)
    // console.log(`Event: ${JSON.stringify(event.log)}`)

    const filter = { contractAddress }
    const update = { state: purchaseEvents[state] }

    const existingPurchase = await purchaseRepository.findOne(filter)
    if (!existingPurchase) {
      console.error(`Purchase not found: ${contractAddress}`)
      return null
    }

    if (!purchaseEvents[state]) {
      console.error(`Invalid state: ${state}`)
      return null
    }

    if (purchaseEvents[existingPurchase.state] >= state) {
      console.error(`Invalid state transition: ${existingPurchase.state} to ${purchaseEvents[state]}`)
      return null
    }

    if (purchaseEvents.ABORTED || purchaseEvents.SELLER_REFUNDED) {
      update.isActive = false
    }

    if (purchaseEvents.PURCHASE_CONFIRMED) {
      // TODO: get buyer address
    }

    const purchase = await purchaseRepository.findOneAndUpdate(filter, update, {new: true})
    console.log(`Purchase updated: ${purchase}`)
  } catch (error) {
    console.error(error)
    // TODO: handle error (eg. if database is down, retry later)
  }
}

// TODO: Add "last block" logic to avoid processing the same event multiple times

module.exports = { listen }
