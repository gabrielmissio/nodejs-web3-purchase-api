const jwt = require('jsonwebtoken')
const { getSecret } = require('../infra/helper/secret-helper')

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) return res.status(400).json({
    error: 'Missing \'Authorization\' header',
  })

  try {
    const { jwtSecret }  = await getSecret(process.env.JWT_SECRET_ARN)

    jwt.verify(
      token.replace('Bearer ', ''),
      jwtSecret,
    )

    next()
  } catch {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }
}
