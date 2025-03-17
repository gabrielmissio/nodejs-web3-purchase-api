const { connectDB } = require('../infra/helper/db-helper')
const blockcountRepository = require('../infra/repositories/blockcount-repository')
const purchaseRepository = require('../infra/repositories/purchase-repository')
const userRepository = require('../infra/repositories/user-repository')

connectDB().then(() => Promise.all([
  blockcountRepository.deleteMany({}),
  purchaseRepository.deleteMany({}),
  userRepository.deleteMany({}),
])
  .then(() => {
    console.log('All collections cleaned up')
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  }))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })


