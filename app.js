// app.js — FINAL (Render + AWS S3 + Login corrigido)

require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const { Upload } = require('@aws-sdk/lib-storage');

const app = express();
const PORT = process.env.PORT || 3000;

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
// USUÁRIOS (JSON LOCAL)
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
  try {
    return JSON.parse(fs.readFileSync(usersFile));
  } catch {
    return [];
  }
}

// =======================
// MIDDLEWARES
// =======================
app.use(express.static('public'));
app.use(express.json());
app.use(fileUpload());

// =======================
// LOGIN / CADASTRO (ROTAS NOVAS)
// =======================
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

  if (users.find((u) => u.username === username)) {
    return res
      .status(409)
      .json({ success: false, message: 'Usuário já existe' });
  }

  users.push({ username, password, role });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ success: true });
});

// =======================
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
  }
});

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
  }
});

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

// =======================
// START
// =======================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
