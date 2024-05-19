const router = require('express').Router()
const purchaseController = require('./presentation/controllers/purchase-controller')

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

router.post('/purchases/publish', purchaseController.publishPurchase)
router.post('/purchases/abort', purchaseController.abortPurchase)
router.post('/purchases/settle-funds', purchaseController.settleFunds)

module.exports = router
