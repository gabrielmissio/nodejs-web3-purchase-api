const router = require('express').Router()
const authMiddleware = require('./middlewares/auth')
const validatorMiddleware = require('./middlewares/validator')
const authController = require('./presentation/controllers/auth-controller')
const authValidations = require('./presentation/validations/auth-validations')
const purchaseController = require('./presentation/controllers/purchase-controller')
const purchaseValidations = require('./presentation/validations/purchase-validations')

// ** Open endpoints **
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

router.post(
  '/auth/login',
  validatorMiddleware(authValidations.login),
  authController.login,
)

router.get(
  '/products',
  validatorMiddleware(purchaseValidations.listProducts),
  purchaseController.listProducts,
)

// ** Protected endpoints **
router.use(authMiddleware)

router.post(
  '/auth/signup',
  validatorMiddleware(authValidations.signup),
  authController.signup,
)

router.post(
  '/auth/change-password',
  validatorMiddleware(authValidations.changePassword),
  authController.changePassword,
)

router.post(
  '/purchases/publish',
  validatorMiddleware(purchaseValidations.publishPurchase),
  purchaseController.publishPurchase,
)

router.post(
  '/purchases/abort',
  validatorMiddleware(purchaseValidations.abortPurchase),
  purchaseController.abortPurchase,
)

router.post(
  '/purchases/settle-funds',
  validatorMiddleware(purchaseValidations.settleFunds),
  purchaseController.settleFunds,
)

module.exports = router
