const Joi = require('joi')

const numbersOnlyRegex = /^\d+$/

const publishPurchase = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    value: Joi.string().regex(numbersOnlyRegex).required(),
  }).required(),
}).unknown(true)

const abortPurchase = Joi.object({
  body: Joi.object({
    contractAddress: Joi.string().required(),
  }).required(),
}).unknown(true)

const settleFunds = Joi.object({
  body: Joi.object({
    contractAddress: Joi.string().required(),
  }).required(),
}).unknown(true)

const listProducts = Joi.object({
  query: Joi.object({
    isActive: Joi.boolean(),
  }).required(),
}).unknown(true)

module.exports = {
  publishPurchase,
  abortPurchase,
  settleFunds,
  listProducts,
}
