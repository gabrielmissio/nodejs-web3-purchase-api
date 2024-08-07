const router = require('express').Router()
const validatorMiddleware = require('../../middlewares/validator')
const purchaseController = require('../../presentation/controllers/purchase-controller')
const purchaseValidations = require('../../presentation/validations/purchase-validations')

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

router.get(
  '/products',
  validatorMiddleware(purchaseValidations.listProducts),
  purchaseController.listProducts,
)

router.get('*',function (req, res) {
  return res.status(200).json({ message: 'You should not be here' })
})

module.exports = router
