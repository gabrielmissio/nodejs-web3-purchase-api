const app = require('./app')
const purchaseListener = require('./listener')
const { connectDB } = require('./infra/helper/db-helper')

const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })

  purchaseListener.listen(() => {
    console.log('Listening for PurchaseStateChange events...')
  })
}).catch((error) => {
  console.error('Error connecting to the database:', error)
  process.exit(1)
})
