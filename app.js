// =======================
// app.js — FINAL DEFINITIVO
// Render + Node + MongoDB Atlas + AWS S3
// =======================

// 1️⃣ DOTENV PRIMEIRO (OBRIGATÓRIO)
require('dotenv').config();

// =======================
// DEPENDÊNCIAS
// =======================
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const { Upload } = require('@aws-sdk/lib-storage');

// =======================
// APP
// =======================
const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// DEBUG DE AMBIENTE
// =======================
console.log('MONGO_URI:', process.env.MONGO_URI ? 'OK' : 'UNDEFINED');

// ❌ Se aparecer UNDEFINED, o erro é VARIÁVEL NO RENDER
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI NÃO CARREGADA');
}

// =======================
// MONGODB
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado com sucesso'))
  .catch((err) => {
    console.error('❌ Erro ao conectar no MongoDB:', err);
    process.exit(1);
  });

// =======================
// AWS S3
// =======================
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME;

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());

// =======================
// USUÁRIOS (LOCAL)
// =======================
const usersFile = path.join(__dirname, 'users.json');

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
  );
}

function getUsers() {
  return JSON.parse(fs.readFileSync(usersFile));
}

// =======================
// LOGIN
// =======================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  res.json({ success: !!user, role: user?.role });
});

// =======================
// UPLOAD
// =======================
app.post('/upload', async (req, res) => {
  if (!req.files?.file) return res.sendStatus(400);

  const file = req.files.file;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: `uploads/${file.name}`,
        Body: file.data,
        ContentType: file.mimetype,
      },
    });

    await upload.done();
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro upload:', err);
    res.sendStatus(500);
  }
});

// =======================
// LIST FILES
// =======================
app.get('/files', async (req, res) => {
  try {
    const data = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'uploads/',
      })
    );

    const files =
      data.Contents?.map((f) =>
        f.Key.replace('uploads/', '')
      ).filter(Boolean) || [];

    res.json(files);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// =======================
// START
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
