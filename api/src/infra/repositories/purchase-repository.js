const mongoose = require('mongoose')

mongoose
  .connect(process.env.DATABASE_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  })

const purchaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    contractAddress: { type: String, required: true },
  },
  {
    timestamps: true, // This enables the createdAt and updatedAt fields
  },
)

module.exports = mongoose.model('Purchase', purchaseSchema)
