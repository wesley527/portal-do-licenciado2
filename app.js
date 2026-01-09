// =======================
// app.js — DEFINITIVO / ESTÁVEL
// =======================

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// =======================
// APP
// =======================
const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// DIRNAME (ESM)
// =======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());

// =======================
// DEBUG ENV (OBRIGATÓRIO)
// =======================
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ?? 'UNDEFINED');

// =======================
// MONGODB (SEGURO)
// =======================
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI NÃO CARREGADA');
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Erro MongoDB:', err.message));
}

// =======================
// ROTAS BÁSICAS
// =======================
app.get('/', (req, res) => {
  res.send('Servidor online 🚀');
});

// =======================
// START
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
