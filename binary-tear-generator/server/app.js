const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI
const client = uri
  ? new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 15000,
    })
  : null

let db
let tearsCollection
let dbReady = false
let dbPromise = null

async function connectDB() {
  if (dbReady && tearsCollection) {
    return true
  }

  if (!client) {
    dbReady = false
    return false
  }

  if (!dbPromise) {
    dbPromise = client
      .connect()
      .then(() => {
        db = client.db('novon')
        tearsCollection = db.collection('tears')
        dbReady = true
        console.log('MongoDB connected')
        return true
      })
      .catch((error) => {
        dbReady = false
        dbPromise = null
        console.error('MongoDB connection failed:', error)
        return false
      })
  }

  return dbPromise
}

app.get('/', (req, res) => {
  res.json({
    service: 'novon-tears-api',
    ok: true,
    dbReady,
  })
})

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    dbReady,
    service: 'novon-tears-api',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/tears', async (req, res, next) => {
  if (!dbReady) {
    await connectDB()
  }

  if (!dbReady || !tearsCollection) {
    return res.status(503).json({ error: '数据库暂不可用' })
  }

  return next()
})

app.post('/api/tears', async (req, res) => {
  try {
    const { text, binary, tearId, emotion, name } = req.body

    if (!text || !binary || !tearId || !emotion) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const tearData = {
      text,
      binary,
      tearId,
      emotion,
      name: name || `Tear-${Date.now()}`,
      timestamp: new Date(),
      likes: 0,
      public: true,
    }

    const result = await tearsCollection.insertOne(tearData)
    res.status(201).json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Save failed:', error)
    res.status(500).json({ error: '保存失败' })
  }
})

app.get('/api/tears/latest', async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 20
    const tears = await tearsCollection
      .find({ public: true })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    res.json(tears)
  } catch (error) {
    console.error('Fetch latest failed:', error)
    res.status(500).json({ error: '获取失败' })
  }
})

app.get('/api/tears/hot', async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 20
    const tears = await tearsCollection
      .find({ public: true })
      .sort({ likes: -1 })
      .limit(limit)
      .toArray()

    res.json(tears)
  } catch (error) {
    console.error('Fetch hot failed:', error)
    res.status(500).json({ error: '获取失败' })
  }
})

app.post('/api/tears/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的泪水 ID' })
    }

    const result = await tearsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: '泪水不存在' })
    }

    return res.json({ success: true })
  } catch (error) {
    console.error('Like failed:', error)
    return res.status(500).json({ error: '点赞失败' })
  }
})

app.get('/api/tears/:id', async (req, res) => {
  try {
    const { id } = req.params
    let tear

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      tear = await tearsCollection.findOne({ _id: new ObjectId(id) })
    }

    if (!tear) {
      tear = await tearsCollection.findOne({ tearId: id })
    }

    if (!tear) {
      return res.status(404).json({ error: '泪水不存在' })
    }

    return res.json(tear)
  } catch (error) {
    console.error('Fetch by id failed:', error)
    return res.status(500).json({ error: '获取失败' })
  }
})

module.exports = {
  app,
  connectDB,
}
