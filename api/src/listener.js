const {
  getContractInstance,
} = require('./utils/contract-helper')
const purchaseEvents = require('./utils/purchase-events')
const purchaseRepository = require('./infra/repositories/purchase-repository')

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const contractInstance = getContractInstance({
  contractName: 'PurchaseEventProxy', contractAddress,
})
contractInstance.on('PurchaseStateChange', eventHandler)

async function eventHandler(contractAddress, state, event) {
  try {
    console.log(`Purchase Contract Address: ${contractAddress}`)
    console.log(`State: ${purchaseEvents[state]}`)
    console.log(`State: ${state}`)
    console.log(`Event: ${JSON.stringify(event.log)}`)

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

    if (existingPurchase.state >= purchaseEvents[state]) {
      console.error(`Invalid state transition: ${existingPurchase.state} to ${purchaseEvents[state]}`)
      return null
    }
    // check if contract exists
    // check if the new state is a valid state
    // check if the new state is bigger than the current state

    if (purchaseEvents.ABORTED || purchaseEvents.SELLER_REFUNDED) {
      update.isActive = false
      return null
    }

    if (purchaseEvents.PURCHASE_CONFIRMED) {
      // TODO: get buyer address
    }

    const purchase = await purchaseRepository.findOneAndUpdate(filter, update, {new: true})
    console.log(`Purchase updated: ${purchase}`)
  } catch (error) {
    console.error(error)
  }
}

console.log('Listening for PurchaseStateChange events...')
