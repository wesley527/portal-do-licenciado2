require('dotenv').config()

// =======================
// IMPORTS
// =======================
const express = require('express')
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

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
const PORT = process.env.PORT || 3000

// =======================
// MIDDLEWARES
// =======================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static('public'))

// =======================
// DEBUG
// =======================
console.log('MONGO_URI:', process.env.MONGO_URI ? 'OK' : 'UNDEFINED')

// =======================
// MONGODB
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error('❌ Erro MongoDB:', err))

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
// USUÁRIOS (JSON LOCAL)
// =======================
const usersFile = path.join(__dirname, 'users.json')

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(
    usersFile,
    JSON.stringify(
      [
        { username: 'moderador', password: '1234', role: 'moderador' },
        { username: 'funcionario', password: '1234', role: 'funcionario' },
      ],
      null,
      2
    )
  )
}

function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile))
  } catch {
    return []
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

// =======================
// ROTAS BÁSICAS
// =======================
app.get('/', (_, res) => {
  res.send('Servidor rodando 🚀')
})

// =======================
// LOGIN / CADASTRO
// =======================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const users = getUsers()

  const user = users.find(
    (u) => u.username === username && u.password === password
  )

  if (!user) return res.json({ success: false })

  res.json({
    success: true,
    username: user.username,
    role: user.role,
  })
})

app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body
  if (!username || !password || !role)
    return res.status(400).json({ success: false })

  const users = getUsers()
  if (users.find((u) => u.username === username))
    return res.status(409).json({ success: false })

  users.push({ username, password, role })
  saveUsers(users)

  res.json({ success: true })
})

// =======================
// FUNÇÕES S3
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
  return (
    data.Contents?.map((o) => o.Key.replace(prefix, '')).filter(Boolean) || []
  )
}

// =======================
// UPLOADS
// =======================
app.post('/upload', async (req, res) => {
  if (!req.files?.file) return res.sendStatus(400)
  try {
    await uploadToS3(req.files.file, 'uploads')
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.post('/upload-treinamentos', async (req, res) => {
  if (!req.files?.file) return res.sendStatus(400)
  try {
    await uploadToS3(req.files.file, 'treinamentos')
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

// =======================
// LISTAGEM
// =======================
app.get('/files', async (_, res) => {
  res.json(await listFiles('uploads/'))
})

app.get('/files-treinamentos', async (_, res) => {
  res.json(await listFiles('treinamentos/'))
})

// =======================
// DOWNLOAD
// =======================
app.get('/download/:filename', async (req, res) => {
  try {
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
  } catch {
    res.sendStatus(404)
  }
})

app.get('/download-treinamentos/:filename', async (req, res) => {
  try {
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
  } catch {
    res.sendStatus(404)
  }
})

// =======================
// DELETE
// =======================
app.delete('/delete/:filename', async (req, res) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `uploads/${req.params.filename}`,
      })
    )
    res.sendStatus(200)
  } catch {
    res.sendStatus(404)
  }
})

app.delete('/delete-treinamentos/:filename', async (req, res) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `treinamentos/${req.params.filename}`,
      })
    )
    res.sendStatus(200)
  } catch {
    res.sendStatus(404)
  }
})

// =======================
// START
// =======================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
})
