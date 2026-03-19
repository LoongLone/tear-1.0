const { app, connectDB } = require('../app')

module.exports = async (req, res) => {
  await connectDB()
  return app(req, res)
}
