<<<<<<< HEAD
// app.js — FINAL (Render + AWS S3 + Login corrigido)
=======
// app.js — FINAL DEFINITIVO (Render + MongoDB + AWS S3)
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

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

<<<<<<< HEAD
const { Upload } = require('@aws-sdk/lib-storage');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
=======
const { Upload } = require('@aws-sdk/lib-storage')

// =======================
// APP
// =======================
const app = express()

// =======================
// MIDDLEWARES
// =======================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static('public'))

// =======================
// DEBUG RENDER
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
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
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
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
}

function getUsers() {
  try {
<<<<<<< HEAD
    return JSON.parse(fs.readFileSync(usersFile));
=======
    return JSON.parse(fs.readFileSync(usersFile))
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
  } catch {
    return []
  }
}

// =======================
// ROTAS BÁSICAS
// =======================
app.get('/', (req, res) => {
  res.send('Servidor rodando 🚀')
})

// =======================
// LOGIN / CADASTRO (ROTAS NOVAS)
// =======================
<<<<<<< HEAD
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    role: user.role,
    username: user.username,
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false });
  }

  const users = getUsers();
=======
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = getUsersArray().find(
    (u) => u.username === username && u.password === password
  )
  res.json(user ? { success: true, role: user.role } : { success: false })
})

app.post('/register', (req, res) => {
  const { username, password, role } = req.body
  const users = getUsersArray()
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ success: false })
  }

  users.push({ username, password, role })
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  res.json({ success: true })
})

// =======================
<<<<<<< HEAD
// UPLOADS
// =======================
app.post('/upload', async (req, res) => {
  if (!req.files?.file) {
    return res.status(400).send('Nenhum arquivo enviado');
  }

  const file = req.files.file;
  const key = `uploads/${file.name}`;

  try {
    await new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
      },
    }).done();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
=======
// FUNÇÃO GENÉRICA S3
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

// =======================
// UPLOADS
// =======================
app.post('/upload', async (req, res) => {
  try {
    await uploadToS3(req.files.file, 'uploads')
    res.sendStatus(200)
  } catch {
    res.sendStatus(500)
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
  }
})

<<<<<<< HEAD
app.get('/files', async (req, res) => {
  try {
    const data = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'uploads/',
      })
    );

    const files =
      data.Contents?.map((o) => o.Key.replace('uploads/', '')).filter(Boolean) ||
      [];

    res.json(files);
  } catch {
    res.json([]);
  }
});

app.get('/download/:filename', async (req, res) => {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `uploads/${req.params.filename}`,
      })
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.params.filename}"`
    );
    res.setHeader('Content-Type', data.ContentType);
    data.Body.pipe(res);
  } catch {
    res.sendStatus(404);
  }
});

app.delete('/delete/:filename', async (req, res) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `uploads/${req.params.filename}`,
      })
    );
    res.sendStatus(200);
  } catch {
    res.sendStatus(404);
  }
});

// =======================
// TREINAMENTOS
// =======================
app.post('/upload-treinamentos', async (req, res) => {
  if (!req.files?.file) {
    return res.status(400).send('Nenhum arquivo enviado');
  }

  const file = req.files.file;

  try {
    await new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: `treinamentos/${file.name}`,
        Body: file.data,
        ContentType: file.mimetype,
      },
    }).done();

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
=======
app.post('/upload-treinamentos', async (req, res) => {
  try {
    await uploadToS3(req.files.file, 'treinamentos')
    res.sendStatus(200)
  } catch {
    res.sendStatus(500)
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
  }
})

<<<<<<< HEAD
app.get('/files-treinamentos', async (req, res) => {
  try {
    const data = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'treinamentos/',
      })
    );

    const files =
      data.Contents
        ?.map((o) => o.Key.replace('treinamentos/', ''))
        .filter(Boolean) || [];

    res.json(files);
  } catch {
    res.json([]);
  }
});

app.get('/download-treinamentos/:filename', async (req, res) => {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `treinamentos/${req.params.filename}`,
      })
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.params.filename}"`
    );
    res.setHeader('Content-Type', data.ContentType);
    data.Body.pipe(res);
  } catch {
    res.sendStatus(404);
  }
});

app.delete('/delete-treinamentos/:filename', async (req, res) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `treinamentos/${req.params.filename}`,
      })
    );
    res.sendStatus(200);
  } catch {
    res.sendStatus(404);
  }
});
=======
// =======================
// LISTAGEM
// =======================
async function listFiles(prefix) {
  const data = await s3Client.send(
    new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix })
  )
  return data.Contents?.map((o) => o.Key.replace(prefix, '')).filter(Boolean) || []
}

app.get('/files', async (_, res) => res.json(await listFiles('uploads/')))
app.get('/files-treinamentos', async (_, res) =>
  res.json(await listFiles('treinamentos/'))
)

// =======================
// DOWNLOAD / DELETE
// =======================
app.get('/download/:folder/:file', async (req, res) => {
  const data = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: `${req.params.folder}/${req.params.file}`,
    })
  )
  data.Body.pipe(res)
})

app.delete('/delete/:folder/:file', async (req, res) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: `${req.params.folder}/${req.params.file}`,
    })
  )
  res.sendStatus(200)
})
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

// =======================
// START
// =======================
<<<<<<< HEAD
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
=======
const PORT = process.env.PORT || 3000
app.listen(PORT, () =>
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
)
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
