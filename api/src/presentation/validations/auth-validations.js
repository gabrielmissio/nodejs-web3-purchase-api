const Joi = require('joi')

const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/

const login = Joi.object({
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).required(),
}).unknown(true)

const signup = Joi.object({
  body: Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string()
      .regex(passwordRegex)
      .messages({ 'string.pattern.base': 'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character.' })
      .required(),
  }).required(),
}).unknown(true)

module.exports = {
  login,
  signup,
}
