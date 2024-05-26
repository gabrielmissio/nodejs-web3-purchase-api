const router = require('express').Router()
const validator = require('./middlewares/validator')
const purchaseController = require('./presentation/controllers/purchase-controller')
const purchaseValidations = require('./presentation/validations/purchase-validations')

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

router.post(
  '/purchases/publish',
  validator(purchaseValidations.publishPurchase),
  purchaseController.publishPurchase,
)
router.post(
  '/purchases/abort',
  validator(purchaseValidations.abortPurchase),
  purchaseController.abortPurchase,
)
router.post(
  '/purchases/settle-funds',
  validator(purchaseValidations.settleFunds),
  purchaseController.settleFunds,
)

router.get(
  '/products',
  validator(purchaseValidations.listProducts),
  purchaseController.listProducts,
)

module.exports = router
