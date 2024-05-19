// TODO: CORS headers should not be present or when an origin is not allowed.

module.exports = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  // handle preflight request
  if (req.method === 'OPTIONS') {
    res.set('Content-Length', '0')
    return res.status(204).send()
  }

  next()
}
