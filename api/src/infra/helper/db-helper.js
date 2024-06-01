const mongoose = require('mongoose')

async function connectDB() {
  return mongoose.connect(process.env.DATABASE_CONNECTION_STRING)
}

module.exports = { connectDB }
