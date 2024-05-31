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

// TODO: add time range filter
const listProducts = Joi.object({
  query: Joi.object({
    state: Joi.string(),
    isActive: Joi.boolean(),
    buyerAddress: Joi.string(),
    contractAddress: Joi.string(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }).required(),
}).unknown(true)

module.exports = {
  publishPurchase,
  abortPurchase,
  settleFunds,
  listProducts,
}
