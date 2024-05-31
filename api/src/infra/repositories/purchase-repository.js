const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    contractAddress: { type: String, required: true },
    state: { type: String }, // TODO: use enum for state
    buyerAddress: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    settledAt: { type: Date },
    receivedAt: { type: Date },
    // exchangeRateAtSettlement: { type: String },
  },
  {
    timestamps: true, // This enables the createdAt and updatedAt fields
  },
)

module.exports = mongoose.model('Purchase', purchaseSchema)
