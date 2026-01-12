require('dotenv').config()

// =======================
// IMPORTS
// =======================
const express = require('express')
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')

const {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

const { Upload } = require('@aws-sdk/lib-storage')

// =======================
// APP
// =======================
const app = express()
const PORT = process.env.PORT || 10000

// =======================
// MIDDLEWARES
// =======================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static('public'))

// =======================
// MONGODB CONNECTION
// =======================
mongoose
  .connect(
    'mongodb+srv://avanceultra_db_user:ddMwtOuSv57oNmH4@cluster0.09kjxkc.mongodb.net/portaldb',
    {
      dbName: 'portaldb',
    }
  )
  .then(() => console.log('✅ MongoDB conectado em portaldb'))
  .catch((err) => console.error('❌ Erro MongoDB:', err))

// =======================
// USER MODEL
// =======================
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    lastLogin: Date,
    loginHistory: [
      {
        date: Date,
        ip: String,
      },
    ],
  },
  { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

// =======================
// AWS S3
// =======================
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const bucketName = process.env.AWS_BUCKET_NAME

// =======================
// ROTAS BÁSICAS
// =======================
app.get('/', (_, res) => {
  res.send('Servidor rodando 🚀')
})

// =======================
// LOGIN
// =======================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username, password })
  if (!user) return res.json({ success: false })

  user.lastLogin = new Date()
  user.loginHistory.push({
    date: new Date(),
    ip: req.ip,
  })

  await user.save()

  res.json({
    success: true,
    username: user.username,
    role: user.role,
  })
})

// =======================
// REGISTER
// =======================
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body

  if (!username || !password || !role)
    return res.status(400).json({ success: false })

  const exists = await User.findOne({ username })
  if (exists) return res.status(409).json({ success: false })

  await User.create({ username, password, role })

  res.json({ success: true })
})

// =======================
// S3 FUNCTIONS
// =======================
async function uploadToS3(file, folder) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: `${folder}/${file.name}`,
      Body: file.data,
      ContentType: file.mimetype,
    },
  })
  await upload.done()
}

async function listFiles(prefix) {
  const data = await s3Client.send(
    new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix })
  )
  return data.Contents?.map((o) => o.Key.replace(prefix, '')).filter(Boolean) || []
}

// =======================
// UPLOADS
// =======================
app.post('/upload', async (req, res) => {
  if (!req.files?.file) return res.sendStatus(400)
  await uploadToS3(req.files.file, 'uploads')
  res.sendStatus(200)
})

app.post('/upload-treinamentos', async (req, res) => {
  if (!req.files?.file) return res.sendStatus(400)
  await uploadToS3(req.files.file, 'treinamentos')
  res.sendStatus(200)
})

// =======================
// LISTAGEM
// =======================
app.get('/files', async (_, res) =>
  res.json(await listFiles('uploads/'))
)

app.get('/files-treinamentos', async (_, res) =>
  res.json(await listFiles('treinamentos/'))
)

// =======================
// DOWNLOAD
// =======================
app.get('/download/:filename', async (req, res) => {
  const data = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${req.params.filename}`,
    })
  )
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${req.params.filename}"`
  )
  data.Body.pipe(res)
})

app.get('/download-treinamentos/:filename', async (req, res) => {
  const data = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: `treinamentos/${req.params.filename}`,
    })
  )
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${req.params.filename}"`
  )
  data.Body.pipe(res)
})

// =======================
// DELETE
// =======================
app.delete('/delete/:filename', async (req, res) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${req.params.filename}`,
    })
  )
  res.sendStatus(200)
})

app.delete('/delete-treinamentos/:filename', async (req, res) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: `treinamentos/${req.params.filename}`,
    })
  )
  res.sendStatus(200)
})

// =======================
// START
// =======================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
})
