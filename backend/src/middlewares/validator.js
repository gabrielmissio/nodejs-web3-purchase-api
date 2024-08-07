module.exports = function (schema) {
  return function (req, res, next) {
    const { headers, params, query, body } = req

    const { error, value } = schema.validate({
      headers, params, query, body,
    })

    if (error) {
      return res.status(400).json({
        error: error.message,
      })
    }

    req.headers = value.headers
    req.params = value.params
    req.query = value.query
    req.body = value.body

    next()
  }
}
