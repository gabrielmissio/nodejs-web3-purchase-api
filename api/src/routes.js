const router = require('express').Router()
const productController = require('./presentation/controllers/product-controller')

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

router.post('/products/publish', productController.publishProduct)
router.post('/products/abort-purchase', productController.abortPurchase)

module.exports = router
