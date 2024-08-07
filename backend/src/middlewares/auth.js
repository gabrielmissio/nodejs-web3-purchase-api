const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) return res.status(400).json({
    error: 'Missing \'Authorization\' header',
  })

  try {
    jwt.verify(
      token.replace('Bearer ', ''),
      process.env.AUTH_JWT_SECRET,
    )

    next()
  } catch {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }
}
