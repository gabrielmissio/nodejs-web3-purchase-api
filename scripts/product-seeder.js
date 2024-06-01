const { connectDB } = require('../api/src/infra/helper/db-helper')

const purchaseController = require('../api/src/presentation/controllers/purchase-controller')
const eventListener = require('../api/src/listener')

const products = [
  {
    'name': 'Playstation 7',
    'value': '5000000000000000000',
  },
  {
    'name': 'iPhone 22',
    'value': '10000000000000000000',
  },
  {
    'name': 'Galaxy S51',
    'value': '7000000000000000000',
  },
  {
    'name': 'Macbook Pro X7',
    'value': '15000000000000000000',
  },
  {
    'name': 'Tesla Model 7',
    'value': '500000000000000000000',
  },
  {
    'name': 'Rolex GMT-Master VI',
    'value': '250000000000000000000',
  },
  {
    'name': 'Yeezy Boost 15',
    'value': '2000000000000000000',
  },
  {
    'name': 'Louis Vuitton Backpack',
    'value': '2000000000000000000',
  },
  {
    'name': 'Chanel Bag',
    'value': '2000000000000000000',
  },
  {
    'name': 'Gucci Sunglasses',
    'value': '2000000000000000000',
  },
  {
    'name': 'Plutonio 235g',
    'value': '800000000000000000000',    
  },
  {
    'name': 'Reator nucelar sovietico',
    'value': '800000000000000000000',
  },
]

connectDB()
  .then(async () => {
    eventListener.listen()

    console.time('Seed time')
    for (const product of products) {
      const result = await purchaseController.publishPurchase({
        body: product,
      }, {
        // Mock express response object
        status: (code) => ({ json: () => code === 201 }),
      })
      console.log(result)
    }
    console.timeEnd('Seed time')
  })
  .catch((err) => {
    console.error(err)
    eventListener.close()
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
