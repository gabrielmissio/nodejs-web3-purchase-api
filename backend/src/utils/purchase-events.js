const StateEnum = {
  ABORTED: 0,
  PURCHASE_CONFIRMED: 1,
  ITEM_RECEIVED: 2,
  SELLER_REFUNDED: 3,
}

// Add reverse mapping
Object.keys(StateEnum).forEach(key => {
  StateEnum[StateEnum[key]] = key
})

module.exports = Object.freeze(StateEnum)
