const app = require('./app')
const purchaseListener = require('./listener')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
purchaseListener.listen(() => {
  console.log('Listening for PurchaseStateChange events...')
})
