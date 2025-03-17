const mongoose = require('mongoose')

const blockcountSchema = new mongoose.Schema(
  {
    lastFetchedBlock: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true, // This enables the createdAt and updatedAt fields
  },
)

module.exports = mongoose.model('Blockcount', blockcountSchema)
