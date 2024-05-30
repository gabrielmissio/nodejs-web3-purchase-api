// Smart Contract event listeners are a common pattern in blockchain applications.
// They allow you to react to events emitted by Smart Contracts, such as a purchase being confirmed or a refund being requested.

const {
  getProvider,
  getContractInstance,
} = require('./utils/contract-helper')
const purchaseEvents = require('./utils/purchase-events')
const blockcountRepository = require('./infra/repositories/blockcount-repository')
const purchaseRepository = require('./infra/repositories/purchase-repository')

async function listen(callback) {
  const provider = getProvider()

  const blockcount = await blockcountRepository.findOne()
  const currentBlock = await provider.getBlockNumber()
  console.log('Purchase listener status:',
    { lastFetchedBlock: blockcount.lastFetchedBlock, currentBlock },
  )

  const contractInstance = getContractInstance({
    contractName: 'PurchaseEventProxy',
    contractAddress: process.env.PURCHASE_EVENT_PROXY_ADDRESS,
  })

  if (blockcount.lastFetchedBlock < currentBlock) {
    console.log('Syncing past events...')
    await syncPastEvents(contractInstance, blockcount)
    console.log('Past events synced...')
  }

  provider.on('block', async () => {
    // TODO: validate if blockcount has been updated on "syncPastEvents" function
    await syncPastEvents(contractInstance, blockcount)
  })

  if (callback && typeof callback === 'function') {
    callback()
  }
}

async function syncPastEvents(contractInstance, blockcount) {
  // TODO: Handle previous blocks on batches to avoid too many events at once
  const events = await contractInstance.queryFilter(
    'PurchaseStateChange', blockcount.lastFetchedBlock, 'latest', eventHandler,
  )
  for (const event of events) {
    await eventHandler(...event.args)
    // TODO: handle multiple events at once
    // TODO: Handle error (eg. if database is down, retry later)

    if (event.blockNumber > blockcount.lastFetchedBlock) {
      blockcount.lastFetchedBlock = event.blockNumber
      await blockcount.save()
      console.log('Blockcount updated:', blockcount)
    }
  }
}

async function eventHandler(contractAddress, stateHex) {
  try {
    const state = parseInt(stateHex, 16)
    console.log(`State: ${purchaseEvents[state]}`)
    console.log(`Contract Address: ${contractAddress}`)

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

    if (state === purchaseEvents.ABORTED || state === purchaseEvents.SELLER_REFUNDED) {
      update.isActive = false
    }

    if (state === purchaseEvents.PURCHASE_CONFIRMED) {
      update.buyerAddress = (await getContractInstance({
        contractName: 'Purchase', contractAddress,
      }).buyer()).toLowerCase()
    }

    const purchase = await purchaseRepository.findOneAndUpdate(filter, update, {new: true})
    console.log(`Purchase updated: ${purchase}`)
  } catch (error) {
    console.error(error)
    // TODO: handle error (eg. if database is down, retry later)
  }
}

module.exports = { listen }
