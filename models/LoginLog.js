const mongoose = require('mongoose')

const LoginLogSchema = new mongoose.Schema({
  username: String,
  role: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('LoginLog', LoginLogSchema)