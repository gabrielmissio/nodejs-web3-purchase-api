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

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, required: true, default: 'admin' },
  },
  {
    timestamps: true, // This enables the createdAt and updatedAt fields
  },
)

module.exports = mongoose.model('User', userSchema)
