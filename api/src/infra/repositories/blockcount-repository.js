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

const blockcountSchema = new mongoose.Schema(
  {
    lastFetchedBlock: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true, // This enables the createdAt and updatedAt fields
  },
)


module.exports = mongoose.model('Blockcount', blockcountSchema)
