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

  if (currentBlock > blockcount.lastFetchedBlock) {
    console.log('Syncing past events...')
    await syncPastEvents(contractInstance, blockcount)
    console.log('Past events synced...')
  }

  provider.on('block', async () => {
    await syncPastEvents(contractInstance, blockcount)
  })

  if (callback && typeof callback === 'function') {
    callback()
  }
}

async function syncPastEvents(contractInstance, blockcount) {
  const currentBlock = await getProvider().getBlockNumber()
  const events = await contractInstance.queryFilter(
    'PurchaseStateChange', blockcount.lastFetchedBlock, currentBlock,
  )

  for (const event of events) {
    await eventHandler(event)
    // TODO: handle multiple events at once
    // TODO: Handle error (eg. if database is down, retry later)

    if (event.blockNumber > blockcount.lastFetchedBlock) {
      blockcount.lastFetchedBlock = event.blockNumber
      await blockcount.save()
    }
  }

  if (currentBlock > blockcount.lastFetchedBlock) {
    blockcount.lastFetchedBlock = currentBlock
    await blockcount.save()
  }
}

async function eventHandler(event) {
  try {
    const [contractAddress, stateHex] = event.args
    const state = parseInt(stateHex, 16)
    console.log(`State: ${purchaseEvents[state]}`)
    console.log(`Contract Address: ${contractAddress}`)

    const filter = { contractAddress }
    const update = { state: purchaseEvents[state] }

    const existingPurchase = await purchaseRepository.findOne(filter)
    if (!existingPurchase) {
      console.error(`Purchase not found: ${contractAddress}`)
      return null
    } else if (!purchaseEvents[state]) {
      console.error(`Invalid state: ${state}`)
      return null
    } else if (purchaseEvents[existingPurchase.state] >= state) {
      console.error(`Invalid state transition: ${existingPurchase.state} to ${purchaseEvents[state]}`)
      return null
    }

    if (state === purchaseEvents.PURCHASE_CONFIRMED) {
      update.buyerAddress = (await getContractInstance({
        contractName: 'Purchase', contractAddress,
      }).buyer()).toLowerCase()

      update.settledAt = new Date(
        (await getProvider().getBlock(event.blockNumber)).timestamp * 1000,
      )
    } else if (state === purchaseEvents.ITEM_RECEIVED) {
      update.receivedAt = new Date(
        (await getProvider().getBlock(event.blockNumber)).timestamp * 1000,
      )
    } else if (state === purchaseEvents.ABORTED || state === purchaseEvents.SELLER_REFUNDED) {
      update.isActive = false
    }

    const purchase = await purchaseRepository.findOneAndUpdate(filter, update, {new: true})
    console.log(`Purchase updated: ${purchase}`)
  } catch (error) {
    console.error(error)
    // TODO: handle error (eg. if database is down, retry later)
  }
}

function close() {
  const provider = getProvider()
  provider.removeAllListeners('block')
}

module.exports = {
  listen,
  close,
}
