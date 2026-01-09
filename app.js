// app.js — versão FINAL corrigida para Render + AWS S3

import mongoose from "mongoose";

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso"))
  .catch(err => console.error("Erro ao conectar no MongoDB", err));

require('dotenv').config();

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

const app = express();

// ✅ PORTA CORRETA PARA O RENDER
const PORT = process.env.PORT || 3000;

// =======================
// CONFIGURAÇÃO AWS S3
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
// USUÁRIOS (LOCAL)
// =======================
const usersFile = path.join(__dirname, 'users.json');

if (!fs.existsSync(usersFile)) {
  const initialUsers = [
    { username: 'moderador', password: '1234', role: 'moderador' },
    { username: 'funcionario', password: '1234', role: 'funcionario' },
  ];
  fs.writeFileSync(usersFile, JSON.stringify(initialUsers, null, 2));
}

function getUsersArray() {
  try {
    const data = JSON.parse(fs.readFileSync(usersFile));
    return Array.isArray(data) ? data : [];
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
// LOGIN / CADASTRO
// =======================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsersArray();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false });
  }
});

app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false });
  }

  const users = getUsersArray();

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
// UPLOAD / DOWNLOAD - UPLOADS
// =======================
app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const file = req.files.file;
  const key = `uploads/${file.name}`;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
      },
    });

    await upload.done();
    res.send('Arquivo enviado com sucesso.');
  } catch (err) {
    console.error('Erro em /upload:', err);
    res.status(500).send('Erro ao enviar arquivo.');
  }
});

app.get('/files', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'uploads/',
    });

    const data = await s3Client.send(command);
    const files =
      data.Contents?.map((obj) =>
        obj.Key.replace('uploads/', '')
      ).filter(Boolean) || [];

    res.json(files);
  } catch (err) {
    console.error('Erro em /files:', err);
    res.status(500).json([]);
  }
});

app.get('/download/:filename', async (req, res) => {
  const key = `uploads/${req.params.filename}`;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const data = await s3Client.send(command);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.params.filename}"`
    );
    res.setHeader(
      'Content-Type',
      data.ContentType || 'application/octet-stream'
    );

    data.Body.pipe(res);
  } catch (err) {
    console.error('Erro em /download:', err);
    res.status(404).send('Arquivo não encontrado.');
  }
});

app.delete('/delete/:filename', async (req, res) => {
  const key = `uploads/${req.params.filename}`;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro em /delete:', err);
    res.status(404).send('Arquivo não encontrado.');
  }
});

// =======================
// UPLOAD / DOWNLOAD - TREINAMENTOS
// =======================
app.post('/upload-treinamentos', async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const file = req.files.file;
  const key = `treinamentos/${file.name}`;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
      },
    });

    await upload.done();
    res.send('Arquivo enviado com sucesso.');
  } catch (err) {
    console.error('Erro em /upload-treinamentos:', err);
    res.status(500).send('Erro ao enviar arquivo.');
  }
});

app.get('/files-treinamentos', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'treinamentos/',
    });

    const data = await s3Client.send(command);
    const files =
      data.Contents?.map((obj) =>
        obj.Key.replace('treinamentos/', '')
      ).filter(Boolean) || [];

    res.json(files);
  } catch (err) {
    console.error('Erro em /files-treinamentos:', err);
    res.status(500).json([]);
  }
});

app.get('/download-treinamentos/:filename', async (req, res) => {
  const key = `treinamentos/${req.params.filename}`;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const data = await s3Client.send(command);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.params.filename}"`
    );
    res.setHeader(
      'Content-Type',
      data.ContentType || 'application/octet-stream'
    );

    data.Body.pipe(res);
  } catch (err) {
    console.error('Erro em /download-treinamentos:', err);
    res.status(404).send('Arquivo não encontrado.');
  }
});

app.delete('/delete-treinamentos/:filename', async (req, res) => {
  const key = `treinamentos/${req.params.filename}`;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro em /delete-treinamentos:', err);
    res.status(404).send('Arquivo não encontrado.');
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
