const { connectDB } = require('../../infra/helper/db-helper')
const { listen } = require('./app')

connectDB().then(() => {
  listen(() => {
    console.log('=> listening for purchase events...')
  })
}).catch((err) => {
  console.error(err)
})
