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

// Pre 'findOne' hook to convert string ID to ObjectId
userSchema.pre('findOne', function(next) {
  const providedId = this.getQuery()._id

  if (providedId && typeof providedId === 'string') {
    try {
      const parsedId = new mongoose.Types.ObjectId(providedId)
      this.getQuery()._id = parsedId
    } catch (error) {
      return next(error)
    }
  }

  next()
})


module.exports = mongoose.model('User', userSchema)
