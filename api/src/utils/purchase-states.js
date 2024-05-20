const StateEnum = {
  CREATED: 0,
  LOCKED: 1,
  RELEASE: 2,
  INACTIVE: 3,
}

// Add reverse mapping
Object.keys(StateEnum).forEach(key => {
  StateEnum[StateEnum[key]] = key
})

module.exports = Object.freeze(StateEnum)
