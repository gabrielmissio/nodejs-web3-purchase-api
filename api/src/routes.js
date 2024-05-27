const router = require('express').Router()
const validator = require('./middlewares/validator')
const authController = require('./presentation/controllers/auth-controller')
const authValidations = require('./presentation/validations/auth-validations')
const purchaseController = require('./presentation/controllers/purchase-controller')
const purchaseValidations = require('./presentation/validations/purchase-validations')

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

// Auth endpoints
router.post(
  '/auth/login',
  validator(authValidations.login),
  authController.login,
)
router.post(
  '/auth/signup',
  validator(authValidations.signup),
  authController.signup,
)
router.post(
  '/auth/change-password',
  validator(authValidations.changePassword),
  authController.changePassword,
)

// Purchase endpoints
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
